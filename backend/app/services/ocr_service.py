import pytesseract
from PIL import Image
import pdfplumber
import os


async def extract_text_from_file(file_path: str) -> str:
    ext = file_path.rsplit(".", 1)[-1].lower() if "." in file_path else ""

    if ext in ("png", "jpg", "jpeg", "bmp", "tiff"):
        return await _extract_image_text(file_path)
    elif ext == "pdf":
        return _extract_pdf_text(file_path)
    else:
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                return f.read()
        except Exception:
            return await _extract_image_text(file_path)


async def _extract_image_text(file_path: str) -> str:
    try:
        image = Image.open(file_path)
        text = pytesseract.image_to_string(image)
        return text.strip()
    except Exception as e:
        return f"Could not extract text from image: {e}"


def _extract_pdf_text(file_path: str) -> str:
    try:
        text_parts = []
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text_parts.append(page_text)
        return "\n".join(text_parts).strip()
    except Exception as e:
        return f"Could not extract text from PDF: {e}"
