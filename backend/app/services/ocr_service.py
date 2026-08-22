from __future__ import annotations

from io import BytesIO
from pathlib import Path

import pymupdf
import pytesseract
from PIL import Image, ImageOps


class OCRProcessingError(Exception):
    """Raised when OCR processing fails."""


def _configure_tesseract() -> None:
    """
    Make sure pytesseract can find the Tesseract executable.
    """

    try:
        pytesseract.get_tesseract_version()
        return

    except Exception:
        pass

    possible_paths = [
        Path(
            r"C:\Program Files\Tesseract-OCR\tesseract.exe"
        ),
        Path(
            r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe"
        ),
    ]

    for path in possible_paths:

        if path.exists():

            pytesseract.pytesseract.tesseract_cmd = (
                str(path)
            )

            try:
                pytesseract.get_tesseract_version()
                return

            except Exception:
                continue

    raise OCRProcessingError(
        "Tesseract OCR is not available. "
        "Please make sure Tesseract is installed."
    )


def _prepare_image(
    image: Image.Image,
) -> Image.Image:

    image = ImageOps.exif_transpose(
        image
    )

    if image.mode not in (
        "RGB",
        "L",
    ):
        image = image.convert(
            "RGB"
        )

    max_dimension = 3000

    width, height = image.size

    largest_dimension = max(
        width,
        height,
    )

    if largest_dimension > max_dimension:

        scale = (
            max_dimension
            / largest_dimension
        )

        new_size = (
            max(
                1,
                int(width * scale),
            ),
            max(
                1,
                int(height * scale),
            ),
        )

        image = image.resize(
            new_size,
            Image.Resampling.LANCZOS,
        )

    return image


def extract_text_from_image(
    image_bytes: bytes,
) -> str:

    if not image_bytes:
        raise OCRProcessingError(
            "The uploaded image is empty."
        )

    _configure_tesseract()

    try:

        with Image.open(
            BytesIO(image_bytes)
        ) as source_image:

            image = _prepare_image(
                source_image.copy()
            )

            text = pytesseract.image_to_string(
                image,
                config="--oem 3 --psm 6",
            )

            return text.strip()

    except OCRProcessingError:
        raise

    except Exception as exc:
        raise OCRProcessingError(
            "Unable to extract text from this image."
        ) from exc


def extract_text_from_pdf_ocr(
    file_bytes: bytes,
) -> tuple[str, int]:

    if not file_bytes:
        raise OCRProcessingError(
            "The uploaded PDF is empty."
        )

    _configure_tesseract()

    try:

        document = pymupdf.open(
            stream=file_bytes,
            filetype="pdf",
        )

        try:

            page_text: list[str] = []

            for page in document:

                pixmap = page.get_pixmap(
                    matrix=pymupdf.Matrix(
                        2,
                        2,
                    ),
                    alpha=False,
                )

                image_bytes = pixmap.tobytes(
                    "png"
                )

                text = extract_text_from_image(
                    image_bytes
                )

                if text.strip():

                    page_text.append(
                        text.strip()
                    )

            return (
                "\n\n".join(
                    page_text
                ).strip(),
                len(document),
            )

        finally:
            document.close()

    except OCRProcessingError:
        raise

    except Exception as exc:
        raise OCRProcessingError(
            "Unable to perform OCR on this PDF."
        ) from exc


def extract_text_from_image_path(
    image_path: str | Path,
) -> str:

    path = Path(
        image_path
    )

    if not path.exists():
        raise OCRProcessingError(
            "The image file could not be found."
        )

    try:

        image_bytes = path.read_bytes()

    except OSError as exc:
        raise OCRProcessingError(
            "Unable to read the image file."
        ) from exc

    return extract_text_from_image(
        image_bytes
    )