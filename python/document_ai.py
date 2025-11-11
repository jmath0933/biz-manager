from google.cloud import documentai_v1 as documentai

project_id = "your-project-id"
location = "asia-northeast3"  # 한국 리전
processor_id = "your-processor-id"
file_path = "invoice.pdf"

client = documentai.DocumentUnderstandingServiceClient()

with open(file_path, "rb") as f:
    content = f.read()

document = documentai.types.Document()
document.content = content

request = documentai.types.ProcessRequest(
    name=f"projects/{project_id}/locations/{location}/processors/{processor_id}",
    raw_document=documentai.types.RawDocument(content=content, mime_type="application/pdf"),
)

result = client.process_document(request=request)
print(result.document.text)
