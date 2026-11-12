import re
import numpy as np
from typing import Dict, Any, Optional

try:
    import cv2
except ImportError:
    cv2 = None

try:
    from paddleocr import PaddleOCR
    # Initialize OCR engine once
    ocr_engine = PaddleOCR(use_angle_cls=True, lang='en', show_log=False)
except Exception:
    ocr_engine = None

def preprocess_image(image_bytes: bytes):
    """
    OpenCV Document Preprocessing Pipeline:
    - Decode bytes
    - Grayscale conversion
    - Denoising / Gaussian blur
    - Adaptive or Otsu Thresholding
    """
    if cv2 is None:
        return None
        
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        return None

    # Grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # Noise removal with bilateral filter to preserve edges
    denoised = cv2.bilateralFilter(gray, 9, 75, 75)
    
    # Adaptive thresholding
    thresh = cv2.adaptiveThreshold(
        denoised, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 31, 2
    )
    return thresh, img

def run_ocr(image_bytes: bytes) -> str:
    """
    Extracts text using PaddleOCR (with fallback to pure string simulation if OCR unavailable).
    """
    extracted_text = ""
    if ocr_engine is not None and cv2 is not None:
        try:
            nparr = np.frombuffer(image_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            result = ocr_engine.ocr(img, cls=True)
            if result and result[0]:
                lines = [line[1][0] for line in result[0]]
                extracted_text = "\n".join(lines)
                return extracted_text
        except Exception as e:
            print(f"PaddleOCR error: {e}")

    # Fallback heuristic parser for testing/mock environment
    try:
        extracted_text = image_bytes.decode("utf-8", errors="ignore")
    except Exception:
        extracted_text = ""
        
    return extracted_text

def extract_structured_fields(raw_text: str) -> Dict[str, Any]:
    """
    NLP / Heuristic field extraction:
    Extracts student_name, roll_number, college_code/name, degree, department, year, certificate_id.
    """
    extracted = {
        "certificate_id": None,
        "student_name": None,
        "roll_number": None,
        "college_name": None,
        "course": None,
        "department": None,
        "graduation_year": None
    }

    # Match Certificate ID pattern: CERT-[COLLEGE]-[YEAR]-[NUM]
    cert_id_match = re.search(r"CERT-[A-Z0-9]+-\d{4}-\d{5}", raw_text, re.IGNORECASE)
    if cert_id_match:
        extracted["certificate_id"] = cert_id_match.group(0).upper()

    # Match Roll Number (alphanumeric pattern or standard formats)
    roll_match = re.search(r"(?:Roll|Reg(?:istration)?|ID)\s*(?:No|Number)?[:\s\-#]*([A-Z0-9\-]+)", raw_text, re.IGNORECASE)
    if roll_match:
        extracted["roll_number"] = roll_match.group(1).strip()

    # Match Year (prefer explicit Graduation / Academic Year context)
    grad_year_match = re.search(r"(?:academic\s*year|graduation\s*year|graduated\s*in|year\s*of\s*passing|year)[:\s\-]*([2][0][1-3][0-9])", raw_text, re.IGNORECASE)
    if grad_year_match:
        extracted["graduation_year"] = int(grad_year_match.group(1))
    else:
        year_match = re.search(r"\b(20[1-3][0-9])\b", raw_text)
        if year_match:
            extracted["graduation_year"] = int(year_match.group(1))

    # Match Student Name (e.g., Name: John Doe or certifies that John Doe)
    name_match = re.search(r"(?:certifies that|name\s*[:\s\-]|this is to certify that)\s*([A-Za-z\s\.]+)", raw_text, re.IGNORECASE)
    if name_match:
        extracted["student_name"] = name_match.group(1).split("\n")[0].strip()

    # Match Department / Course
    for course_type in ["B.Tech", "Bachelor of Technology", "B.Sc", "M.Tech", "MBA", "BCA", "MCA"]:
        if course_type.lower() in raw_text.lower():
            extracted["course"] = course_type
            break

    for dept in ["Computer Science", "Information Technology", "Mechanical Engineering", "Civil Engineering", "Electronics"]:
        if dept.lower() in raw_text.lower():
            extracted["department"] = dept
            break

    return extracted

