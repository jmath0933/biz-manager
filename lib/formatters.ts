// lib/formatters.ts

// 📌 전화번호 자동 하이픈 + 11자리 제한
export const formatPhone = (value: string) => {
  let digits = value.replace(/\D/g, "");

  if (digits.length > 11) digits = digits.slice(0, 11);

  if (digits.length < 4) return digits;
  if (digits.length < 7) return digits.replace(/(\d{3})(\d{1,3})/, "$1-$2");

  return digits.replace(/(\d{3})(\d{3,4})(\d{4})/, "$1-$2-$3");
};

// 📌 사업자등록번호 자동 하이픈 + 10자리 제한
export const formatBizNumber = (value: string) => {
  let digits = value.replace(/\D/g, "");

  if (digits.length > 10) digits = digits.slice(0, 10);

  if (digits.length < 4) return digits;
  if (digits.length < 6) return digits.replace(/(\d{3})(\d{1,2})/, "$1-$2");

  return digits.replace(/(\d{3})(\d{2})(\d{1,5})/, "$1-$2-$3");
};

// 📌 은행별 계좌번호 패턴
export const bankPatterns: Record<string, number[]> = {
  국민은행: [6, 2, 6],
  농협: [3, 4, 4, 2],
  신한은행: [3, 3, 6],
  기업은행: [3, 6, 2],
  우리은행: [4, 3, 6],
  하나은행: [3, 6, 5],
  카카오뱅크: [4, 2, 6],
  토스뱅크: [3, 4, 4],
  부산은행: [3, 6, 2],
  수협: [3, 4, 4],
  SC제일은행: [4, 2, 7],
};

// 📌 계좌번호 자동 하이픈
export const formatAccountNumber = (bank: string, value: string) => {
  const numbers = value.replace(/\D/g, "");
  const pattern = bankPatterns[bank];

  if (!pattern) return numbers;

  let result = "";
  let index = 0;

  for (let i = 0; i < pattern.length; i++) {
    const part = numbers.substr(index, pattern[i]);
    if (!part) break;

    result += part;
    index += pattern[i];

    if (i < pattern.length - 1 && part.length === pattern[i]) {
      result += "-";
    }
  }

  return result;
};