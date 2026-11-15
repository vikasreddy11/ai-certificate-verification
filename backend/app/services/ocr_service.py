import re
import numpy as np
from typing import Dict, Any, Optional

try:
    import cv2
except ImportError:  # pragma: no cover
    cv2 = None

_engine = None
_engine_failed = False


def get_engine():
    """Lazy-load RapidOCR (ONNX, ~100MB RAM, fits Render's free tier; no model download at runtime)."""
    global _engine, _engine_failed
    if _engine is None and not _engine_failed:
        try:
            from rapidocr_onnxruntime import RapidOCR
            _engine = RapidOCR()
        except Exception as e:
            print(f"[!] OCR engine failed to load: {e}")
            _engine_failed = True
    return _engine


def _decode(image_bytes: bytes):
    if cv2 is None:
        return None
    arr = np.frombuffer(image_bytes, np.uint8)
    return cv2.imdecode(arr, cv2.IMREAD_COLOR)


def decode_qr_certificate_id(image_bytes: bytes) -> Optional[str]:
    """Reads a QR code on the uploaded image and returns the certificate id from .../verify/<id>."""
    img = _decode(image_bytes)
    if img is None:
        return None
    try:
        data, _, _ = cv2.QRCodeDetector().detectAndDecode(img)
    except Exception:
        return None
    if not data:
        return None
    m = re.search(r"(CERT-[A-Za-z0-9]+-\d{4}-\d{4,6})", data, re.IGNORECASE)
    return m.group(1).upper() if m else None


def run_ocr(image_bytes: bytes) -> str:
    """Returns OCR text, one visual line per row. Returns '' if OCR is unavailable (-> manual review)."""
    img = _decode(image_bytes)
    engine = get_engine()
    if img is None or engine is None:
        return ""
    try:
        result, _ = engine(img)
    except Exception as e:
        print(f"[!] OCR execution error: {e}")
        return ""
    if not result:
        return ""
    # result items: [box, text, confidence]; sort top->bottom, left->right
    items = sorted(result, key=lambda r: (round(np.mean([p[1] for p in r[0]]) / 12), r[0][0][0]))
    return "\n".join(r[1] for r in items)


def _has(text: str, alias: str) -> bool:
    return re.search(r"(?<![a-z])" + re.escape(alias) + r"(?![a-z])", text) is not None


def extract_structured_fields(raw_text: str) -> Dict[str, Any]:
    extracted = {
        "certificate_id": None, "student_name": None, "roll_number": None,
        "college_name": None, "course": None, "department": None, "graduation_year": None,
    }
    lines = [l.strip() for l in raw_text.splitlines() if l.strip()]

    # Certificate ID
    m = re.search(r"CERT[-_ ]?[A-Z0-9]+[-_ ]\d{4}[-_ ]\d{4,6}", raw_text, re.IGNORECASE)
    if m:
        extracted["certificate_id"] = re.sub(r"[_ ]", "-", m.group(0).upper())

    # Student name: the line after "This is to certify that"
    for i, line in enumerate(lines):
        if re.search(r"certi[tf]y\s*that", line, re.IGNORECASE):
            tail = re.split(r"certi[tf]y\s*that", line, flags=re.IGNORECASE)[-1].strip()
            cand = tail if len(tail) > 2 else (lines[i + 1].strip() if i + 1 < len(lines) else "")
            if len(cand) > 2 and not cand.lower().startswith("bearing"):
                extracted["student_name"] = cand
            break

    # Roll number: explicit label first, then college-code pattern
    m = re.search(r"roll\s*(?:no\.?|number)?\s*[:#\-]?\s*([A-Za-z0-9]{2,5}[-_][0-9]{4}[-_][0-9]{3,5})", raw_text, re.IGNORECASE)
    if not m:
        m = re.search(r"\b([A-Z][A-Za-z]{2,3}[-_]\d{4}[-_]\d{4,5})\b", raw_text)
    if m:
        roll = m.group(1).replace("_", "-").upper()
        extracted["roll_number"] = roll

    # Graduation year
    m = re.search(r"(?:academic\s*year|graduation\s*year|graduated\s*in|year\s*of\s*passing)[:\s\-]*(20[1-3]\d)", raw_text, re.IGNORECASE)
    if m:
        extracted["graduation_year"] = int(m.group(1))

    low = raw_text.lower()
    for std, aliases in [
        ("Bachelor of Technology", ["bachelor of technology", "b.tech", "btech"]),
        ("Bachelor of Science", ["bachelor of science", "b.sc", "bsc"]),
        ("Master of Technology", ["master of technology", "m.tech", "mtech"]),
        ("Master of Business Administration", ["master of business administration", "mba"]),
    ]:
        if any(_has(low, a) for a in aliases):
            extracted["course"] = std
            break

    for std, aliases in [
        ("Computer Science", ["computer science", "computer science and engineering", "cse"]),
        ("Information Technology", ["information technology"]),
        ("Mechanical Engineering", ["mechanical engineering"]),
        ("Electrical Engineering", ["electrical engineering", "eee"]),
        ("Civil Engineering", ["civil engineering"]),
    ]:
        if any(_has(low, a) for a in aliases):
            extracted["department"] = std
            break

    return extracted
