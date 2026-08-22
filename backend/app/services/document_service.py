from __future__ import annotations

from io import BytesIO

import pymupdf
from PIL import Image

from app.services.ocr_service import (
    OCRProcessingError,
    extract_text_from_image,
    extract_text_from_pdf_ocr,
)


SUPPORTED_TYPES = {
    "application/pdf": "pdf",
    "image/png": "image",
    "image/jpeg": "image",
    "image/jpg": "image",
}

MAX_FILE_SIZE = 10 * 1024 * 1024

MIN_NATIVE_TEXT_LENGTH = 50


class DocumentProcessingError(Exception):
    """Raised when document processing fails."""


def validate_file(
    content_type: str,
    file_size: int,
) -> None:

    if content_type not in SUPPORTED_TYPES:
        raise DocumentProcessingError(
            "Unsupported file type. "
            "Please upload a PDF, PNG, or JPG image."
        )

    if file_size == 0:
        raise DocumentProcessingError(
            "The uploaded file is empty."
        )

    if file_size > MAX_FILE_SIZE:
        raise DocumentProcessingError(
            "File is too large. "
            "Maximum allowed size is 10 MB."
        )


def normalize_text(
    text: str,
) -> str:

    if not text:
        return ""

    lines: list[str] = []

    for line in text.splitlines():

        cleaned = " ".join(
            line.strip().split()
        )

        if cleaned:
            lines.append(cleaned)

    return "\n".join(lines).strip()


def calculate_statistics(
    text: str,
) -> tuple[int, int]:

    words = text.split()

    return (
        len(words),
        len(text),
    )


def extract_pdf_text(
    file_bytes: bytes,
) -> tuple[str, int]:

    try:
        document = pymupdf.open(
            stream=file_bytes,
            filetype="pdf",
        )

        try:
            pages: list[str] = []

            for page in document:

                text = page.get_text(
                    "text"
                ).strip()

                if text:
                    pages.append(text)

            return (
                "\n\n".join(pages).strip(),
                len(document),
            )

        finally:
            document.close()

    except Exception as exc:
        raise DocumentProcessingError(
            "Unable to read this PDF."
        ) from exc


def validate_image(
    file_bytes: bytes,
) -> None:

    try:
        with Image.open(
            BytesIO(file_bytes)
        ) as image:

            image.verify()

    except Exception as exc:
        raise DocumentProcessingError(
            "The uploaded image appears to be "
            "invalid or corrupted."
        ) from exc


def process_document(
    file_bytes: bytes,
    content_type: str,
) -> tuple[str, int | None, str, str]:

    file_size = len(file_bytes)

    validate_file(
        content_type=content_type,
        file_size=file_size,
    )

    document_type = SUPPORTED_TYPES[
        content_type
    ]

    # =========================================================
    # IMAGE
    # =========================================================

    if document_type == "image":

        validate_image(
            file_bytes
        )

        try:
            extracted_text = (
                extract_text_from_image(
                    file_bytes
                )
            )

        except OCRProcessingError as exc:
            raise DocumentProcessingError(
                str(exc)
            ) from exc

        extracted_text = normalize_text(
            extracted_text
        )

        if not extracted_text:
            raise DocumentProcessingError(
                "No readable text was found in this image. "
                "Please upload a clearer document image."
            )

        return (
            extracted_text,
            None,
            document_type,
            "ocr",
        )

    # =========================================================
    # PDF — NATIVE EXTRACTION FIRST
    # =========================================================

    extracted_text, page_count = (
        extract_pdf_text(
            file_bytes
        )
    )

    extracted_text = normalize_text(
        extracted_text
    )

    if len(extracted_text) >= MIN_NATIVE_TEXT_LENGTH:

        return (
            extracted_text,
            page_count,
            document_type,
            "native",
        )

    # =========================================================
    # SCANNED PDF — OCR FALLBACK
    # =========================================================

    try:

        extracted_text, page_count = (
            extract_text_from_pdf_ocr(
                file_bytes
            )
        )

    except OCRProcessingError as exc:
        raise DocumentProcessingError(
            str(exc)
        ) from exc

    extracted_text = normalize_text(
        extracted_text
    )

    if not extracted_text:
        raise DocumentProcessingError(
            "No readable text was found in this PDF. "
            "Please upload a clearer document."
        )

    return (
        extracted_text,
        page_count,
        document_type,
        "ocr",
    )


def get_document_statistics(
    text: str,
) -> tuple[int, int]:

    normalized = normalize_text(
        text
    )

    return calculate_statistics(
        normalized
    )