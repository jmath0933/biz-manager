import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import crypto from "crypto";
import { Dropbox } from "dropbox";
import { getFirestoreSafe } from "@/lib/firebaseAdmin";
import admin from "firebase-admin";
import * as AzureOpenAI from "@azure/openai";

console.log(Object.keys(AzureOpenAI));
// @ts-ignore
/*const client = new AzureOpenAI.OpenAIClient(
  process.env.AZURE_OPENAI_ENDPOINT!,
  //new AzureOpenAI.AzureKeyCredential(process.env.AZURE_OPENAI_KEY!)
);
*/


export const dynamic = "force-dynamic";

// ----------------------
// 파일 업로드 파싱
// ----------------------
async function parseFile(req: NextRequest) {
  const form = await req.formData();
  const file = form.get("file") as File;
  if (!file) throw new Error("파일이 없습니다.");

  const arrayBuf = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuf);

  return {
    fileBuffer: buffer,
    filename: file.name || "upload.xlsx",
  };
}

// ----------------------
// Hash Helper
// ----------------------
function bufferHash(buffer: Buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

// ----------------------
// Excel Helper
// ----------------------
function asString(v: ExcelJS.CellValue | null | undefined): string {
  if (!v) return "";
  if (v instanceof Date) return v.toISOString();
  if (typeof v === "object") return String((v as any).text ?? v);
  return String(v);
}

function readSafe(ws: ExcelJS.Worksheet, addr: string): string {
  try {
    return asString(ws.getCell(addr).value).trim();
  } catch {
    return "";
  }
}

// 승인번호(X2)에서 날짜 추출
function extractApprovalDateFromMerged(ws: ExcelJS.Worksheet): string | null {
  const raw = ws.getCell("Z4").value;
  if (!raw) return null;
  const digits = String(raw).replace(/[^0-9]/g, "");
  return digits.length >= 8 ? digits.slice(0, 8) : null;
}

// 작성일자(B10)에서 날짜 추출
function extractWrittenDate(ws: ExcelJS.Worksheet): string | null {
  const raw = ws.getCell("C12").value;
  if (!raw) return null;

  const s = asString(raw).trim();
  const d = s.replace(/\./g, "-").replace(/\//g, "-");
  const m = d.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);

  if (m) return `${m[1]}${m[2].padStart(2, "0")}${m[3].padStart(2, "0")}`;

  const only = s.replace(/[^0-9]/g, "");
  return only.length >= 8 ? only.slice(0, 8) : null;
}

function formatParts(yyyymmdd: string) {
  return {
    year: yyyymmdd.slice(0, 4),
    yy: yyyymmdd.slice(2, 4),
    mm: yyyymmdd.slice(4, 6),
    dd: yyyymmdd.slice(6, 8),
  };
}

// YYYYMMDD → YYMMDD 숫자로 변환
function toYYMMDDNumber(yyyymmdd: string) {
  if (!/^\d{8}$/.test(yyyymmdd)) {
    const d = new Date();
    return Number(
      `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(
        2,
        "0"
      )}${String(d.getDate()).padStart(2, "0")}`
    );
  }

  return Number(`${yyyymmdd.slice(2, 4)}${yyyymmdd.slice(4, 6)}${yyyymmdd.slice(6, 8)}`);
}

function sanitizeFileName(s: string) {
  return s.replace(/\s+/g, "_").replace(/[\/\\#%&\?\*:\<\>\"|\{\}]/g, "");
}

// ----------------------
// Dropbox
// ----------------------
const DROPBOX = new Dropbox({
  accessToken: process.env.DROPBOX_ACCESS_TOKEN!,
  fetch,
});

// ----------------------
// 메인 POST
// ----------------------
export async function POST(req: NextRequest) {
  console.log("📤 세금계산서 업로드 API 시작");
  
  try {
    const db = getFirestoreSafe();
    if (!db) {
      throw new Error("Firestore 초기화 실패");
    }

    const ownerBiz = (process.env.OWNER_BIZ_NO || "").replace(/[^0-9]/g, "");
    console.log("🏢 사업자번호:", ownerBiz || "(미설정)");

    if (!ownerBiz) {
      console.warn("⚠️ OWNER_BIZ_NO 환경변수가 설정되지 않았습니다.");
      console.warn("⚠️ 매입/매출 자동 판별이 불가능합니다.");
    }

    // 파일 파싱
    const { fileBuffer, filename } = await parseFile(req);
    console.log("📁 업로드된 파일:", filename);

  /*  // ==========================================
    // 중복 체크 (테스트 중에는 주석 처리)
    // ==========================================
    // 프로덕션 배포 시 아래 주석을 해제하세요
    // 같은 파일을 여러 번 업로드하는 것을 방지합니다
    
    const hash = bufferHash(fileBuffer);
    console.log("🔍 파일 해시:", hash);

    const exists = await db.collection("uploads").doc(hash).get();
    if (exists.exists) {
      console.log("⚠️ 이미 처리된 파일입니다.");
      return NextResponse.json({ 
        ok: true, 
        message: "이미 처리된 파일입니다.",
        duplicate: true
      });
    }

    //hash 처리부분*/

    

    // Excel 읽기
    const wb = new ExcelJS.Workbook();
    // @ts-ignore - Buffer 타입 호환성 문제 무시
    await wb.xlsx.load(fileBuffer);
    console.log(`📊 총 ${wb.worksheets.length}개의 시트 발견`);

    const results: any[] = [];
    const errors: any[] = [];

    for (let si = 0; si < wb.worksheets.length; si++) {
      try {
        const ws = wb.worksheets[si];
        console.log(`\n📄 시트 ${si + 1}/${wb.worksheets.length} 처리 중...`);

        // 사업자번호 읽기 (하이픈 모두 제거하여 비교)
        const supplierBiz = readSafe(ws, "H5").replace(/[^\d]/g, "");
        const supplierName = readSafe(ws, "H6");

        const buyerBiz = readSafe(ws, "Z5").replace(/[^\d]/g, "");
        const buyerName = readSafe(ws, "Z6");

        console.log(`  공급자: ${supplierName} (${supplierBiz})`);
        console.log(`  수요자: ${buyerName} (${buyerBiz})`);

        // 날짜 추출 (승인번호 → 작성일자 → 오늘)
        const approval = extractApprovalDateFromMerged(ws);
        const written = extractWrittenDate(ws);
        const yyyymmdd =
          approval ??
          written ??
          (() => {
            const d = new Date();
            return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(
              2,
              "0"
            )}${String(d.getDate()).padStart(2, "0")}`;
          })();

        const { year, yy, mm, dd } = formatParts(yyyymmdd);
        const dateNum = toYYMMDDNumber(yyyymmdd);
        console.log(`  날짜: ${year}-${mm}-${dd} (${dateNum})`);

        // 금액 계산 (음수 처리 포함)
        const supplyAmountStr = readSafe(ws, "H12");
        const taxAmountStr = readSafe(ws, "M12");
        
        // 음수 기호 확인: - (하이픈), ▲ (삼각형), () (괄호)
        const isSupplyNegative = supplyAmountStr.includes("-") || 
                                  supplyAmountStr.includes("▲") ||
                                  (supplyAmountStr.includes("(") && supplyAmountStr.includes(")"));
        const isTaxNegative = taxAmountStr.includes("-") || 
                               taxAmountStr.includes("▲") ||
                               (taxAmountStr.includes("(") && taxAmountStr.includes(")"));
        
        const supplyAmount = (Number(supplyAmountStr.replace(/[^0-9]/g, "")) || 0) * (isSupplyNegative ? -1 : 1);
        const taxAmount = (Number(taxAmountStr.replace(/[^0-9]/g, "")) || 0) * (isTaxNegative ? -1 : 1);
        const totalAmount = supplyAmount + taxAmount;
        
        console.log(`  금액: 공급가 ${supplyAmount.toLocaleString()}원 + 세액 ${taxAmount.toLocaleString()}원 = ${totalAmount.toLocaleString()}원`);
        
        if (supplyAmount < 0 || taxAmount < 0) {
          console.log(`  ⚠️ 수정 세금계산서 (음수 금액 포함)`);
        }

        const firstItem = readSafe(ws, "E12");
        console.log(`  품목: ${firstItem || "(없음)"}`);

        // 매입/매출 판별 (둘 다 하이픈 제거 후 비교)
        let docType: "purchases" | "sales" | "unknown" = "unknown";
        if (ownerBiz) {
          console.log(`  비교: ownerBiz=${ownerBiz}, buyerBiz=${buyerBiz}, supplierBiz=${supplierBiz}`);
          if (buyerBiz === ownerBiz) {
            docType = "purchases";
            console.log(`  ✅ 매입 확인 (수요자가 본인)`);
          } else if (supplierBiz === ownerBiz) {
            docType = "sales";
            console.log(`  ✅ 매출 확인 (공급자가 본인)`);
          }
          console.log("ownerBiz:", ownerBiz)
        }

        if (docType === "unknown") {
          console.log(`  ⚠️ 매입/매출 판별 불가 - 스킵`);
          errors.push({
            index: si,
            error: "매입/매출 판별 불가",
            supplierBiz,
            buyerBiz,
          });
          continue;
        }

        const isPurchase = docType === "purchases";
        const partnerName = isPurchase ? supplierName : buyerName;
        const safePartner = sanitizeFileName(partnerName);

        const flag = isPurchase ? "01" : "02";
        const fileName = `${yy}-${mm}-${dd}_${safePartner}_${totalAmount.toLocaleString("ko-KR")}_${flag}.xlsx`;
        const folder = isPurchase ? "매입" : "매출";
        const dropPath = `/BUSINESS/${year}년 세금계산서/${folder}/${fileName}`;

        console.log(`  📂 Dropbox 경로: ${dropPath}`);

        // ==========================================
        // 원본 시트 복사 (스타일, 수식, 병합 셀 포함)
        // ==========================================
        const sourceWs = wb.worksheets[si];
        const newWb = new ExcelJS.Workbook();
        const newWs = newWb.addWorksheet(sourceWs.name || "Sheet1");

        // 셀 값 + 스타일 + 수식 복사
        sourceWs.eachRow((row, rowNumber) => {
          const newRow = newWs.getRow(rowNumber);
          newRow.height = row.height;

          row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
            const newCell = newRow.getCell(colNumber);

            // 값 복사
            newCell.value = cell.value;

            // 수식 복사
            if (cell.formula) {
              newCell.value = {
                formula: cell.formula,
                result: cell.result,
              };
            }

            // 스타일 복사 (병합된 스타일 객체 사용)
            if (cell.style) {
              newCell.style = {
                ...cell.style
              };
            }
          });

          newRow.commit();
        });

        // 컬럼 너비 복사
        sourceWs.columns.forEach((col, i) => {
          if (col.width) {
            newWs.getColumn(i + 1).width = col.width;
          }
        });

        // 병합 셀 복사
        if (sourceWs.model && sourceWs.model.merges) {
          for (const merge of sourceWs.model.merges) {
            newWs.mergeCells(merge);
          }
        }

        // Excel 버퍼 생성
        const outBuf = await newWb.xlsx.writeBuffer();

        // ==========================================
        // Dropbox 업로드
        // ==========================================
        console.log(`  ☁️ Dropbox 업로드 중...`);
        
        try {
          // 먼저 업로드 시도
          await DROPBOX.filesUpload({
            path: dropPath,
            contents: outBuf,
            mode: { ".tag": "overwrite" },
            autorename: false,
            mute: false,
          });
          console.log(`  ✅ Dropbox 업로드 성공`);
        } catch (uploadErr: any) {
          console.error(`  ❌ Dropbox 업로드 실패:`, uploadErr);
          throw new Error(`Dropbox 업로드 실패: ${uploadErr.message}`);
        }

        // ==========================================
        // 공유 링크 생성
        // ==========================================
        console.log(`  🔗 공유 링크 생성 중...`);
        let url = "";
        
        try {
          // 기존 링크가 있는지 먼저 확인
          const existingLinks = await DROPBOX.sharingListSharedLinks({
            path: dropPath,
            direct_only: true,
          });

          if (existingLinks.result.links && existingLinks.result.links.length > 0) {
            // 기존 링크 사용
            url = existingLinks.result.links[0].url;
            console.log(`  ℹ️ 기존 공유 링크 사용`);
          } else {
            // 새 링크 생성
            const shared = await DROPBOX.sharingCreateSharedLinkWithSettings({
              path: dropPath,
            });
            url = shared.result.url;
            console.log(`  ✅ 새 공유 링크 생성`);
          }

          // URL에 raw 파라미터 추가 (직접 다운로드용)
          if (!url.includes("?")) {
            url = `${url}?raw=1`;
          }

          console.log(`  🔗 공유 링크: ${url}`);
        } catch (linkErr: any) {
          console.error(`  ⚠️ 공유 링크 생성 실패:`, linkErr);
          // 링크 생성 실패해도 계속 진행 (나중에 수동으로 생성 가능)
          url = `파일 업로드 성공, 링크 생성 실패: ${dropPath}`;
        }

        // ==========================================
        // Firestore 저장
        // ==========================================
        if (docType === "purchases") {
          await db.collection("purchases").add({
            date: dateNum,
            supplier: supplierName,
            supplierBiz: supplierBiz,
            item: firstItem,
            supplyValue: supplyAmount,
            tax: taxAmount,
            totalAmount: totalAmount,
            fileUrl: url,
            filePath: dropPath,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          });
          console.log(`  💾 매입 데이터 저장 완료`);
        } else if (docType === "sales") {
          await db.collection("sales").add({
            date: dateNum,
            buyer: buyerName,
            buyerBiz: buyerBiz,
            item: firstItem,
            supplyValue: supplyAmount,
            tax: taxAmount,
            totalAmount: totalAmount,
            fileUrl: url,
            filePath: dropPath,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          });
          console.log(`  💾 매출 데이터 저장 완료`);
        }

        results.push({
          index: si,
          type: docType === "purchases" ? "매입" : "매출",
          partner: partnerName,
          date: `${year}-${mm}-${dd}`,
          total: totalAmount,
          fileUrl: url,
        });
      } catch (sheetErr: any) {
        console.error(`  ❌ 시트 ${si + 1} 처리 실패:`, sheetErr.message);
        errors.push({
          index: si,
          error: sheetErr.message,
        });
      }
    }

    // ==========================================
    // 업로드 기록 저장 (테스트 중에는 주석 처리)
    // ==========================================
    // 프로덕션 배포 시 아래 주석을 해제하세요
    
    //const hash = bufferHash(fileBuffer);
  /*  await db.collection("uploads").doc(hash).set({
      filename,
      processedAt: admin.firestore.FieldValue.serverTimestamp(),
      totalSheets: wb.worksheets.length,
      successCount: results.length,
      errorCount: errors.length,
    });
    

    // hash처리부분*/

    console.log(`\n✅ 처리 완료: 성공 ${results.length}개, 실패 ${errors.length}개`);

    return NextResponse.json({ 
      ok: true, 
      results,
      errors: errors.length > 0 ? errors : undefined,
      summary: {
        total: wb.worksheets.length,
        success: results.length,
        failed: errors.length,
      }
    });
  } catch (err: any) {
    console.error("❌ INVOICE TAX ERROR:", err);
    return NextResponse.json({ 
      ok: false, 
      error: err.message 
    }, { status: 500 });
  }
}