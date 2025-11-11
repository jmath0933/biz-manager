from google.cloud import vision
import sys
import json
import io

# UTF-8 출력 설정
if sys.platform == "win32":
    import codecs
    sys.stdout = codecs.getwriter("utf-8")(sys.stdout.detach())

image_path = sys.argv[1]
client = vision.ImageAnnotatorClient()

with open(image_path, "rb") as image_file:
    content = image_file.read()

image = vision.Image(content=content)
response = client.document_text_detection(image=image)

text = response.full_text_annotation.text

# JSON 출력 (ensure_ascii=False로 한글 유지)
output = json.dumps({"text": text}, ensure_ascii=False)
print(output)