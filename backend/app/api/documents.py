from __future__ import annotations

from fastapi import (
    APIRouter,
    File,
    HTTPException,
    UploadFile,
)
from pydantic import BaseModel

from app.services.ai_service import (
    AIProcessingError,
    analyze_document,
)
from app.services.document_service import (
    DocumentProcessingError,
    get_document_statistics,
    process_document,
)


router = APIRouter(
    prefix="/api/documents",
    tags=["Documents"],
)


class UploadResponse(BaseModel):
    filename: str
    content_type: str
    file_size: int
    document_type: str
    extraction_method: str
    extracted_text: str
    page_count: int | None
    word_count: int
    character_count: int


class AnalysisResponse(BaseModel):
    document_type: str
    summary: str
    key_points: list[str]
    main_ideas: list[str]
    topics: list[str]
    improvement_suggestions: list[str]
    confidence_note: str
    summary_length: str
    processing_method: str
    page_count: int | None
    word_count: int
    character_count: int
    processing_mode: str


def _validate_upload(file: UploadFile) -> str:
    content_type = (
        file.content_type or ""
    ).lower()

    if content_type == "image/jpg":
        return "image/jpeg"

    return content_type


async def _read_upload(
    file: UploadFile,
) -> tuple[bytes, str]:

    content_type = _validate_upload(file)

    try:
        file_bytes = await file.read()
    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail="Unable to read the uploaded file.",
        ) from exc

    return file_bytes, content_type


# =========================================================
# Upload
# =========================================================

@router.post(
    "/upload",
    response_model=UploadResponse,
)
async def upload_document(
    file: UploadFile = File(...),
) -> UploadResponse:

    file_bytes, content_type = await _read_upload(file)

    try:
        (
            extracted_text,
            page_count,
            document_type,
            extraction_method,
        ) = process_document(
            file_bytes=file_bytes,
            content_type=content_type,
        )

    except DocumentProcessingError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc

    word_count, character_count = (
        get_document_statistics(
            extracted_text
        )
    )

    return UploadResponse(
        filename=file.filename or "document",
        content_type=content_type,
        file_size=len(file_bytes),
        document_type=document_type,
        extraction_method=extraction_method,
        extracted_text=extracted_text,
        page_count=page_count,
        word_count=word_count,
        character_count=character_count,
    )


# =========================================================
# Analyze
# =========================================================

@router.post(
    "/analyze",
    response_model=AnalysisResponse,
)
async def analyze_uploaded_document(
    file: UploadFile = File(...),
    summary_length: str = "medium",
) -> AnalysisResponse:

    allowed_lengths = {
        "short",
        "medium",
        "long",
    }

    if summary_length not in allowed_lengths:
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid summary length. "
                "Use short, medium, or long."
            ),
        )

    file_bytes, content_type = await _read_upload(file)

    # ---------------------------------------------------------
    # Extract document text
    # ---------------------------------------------------------

    try:
        (
            extracted_text,
            page_count,
            document_type,
            processing_method,
        ) = process_document(
            file_bytes=file_bytes,
            content_type=content_type,
        )

    except DocumentProcessingError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc

    # ---------------------------------------------------------
    # Statistics
    # ---------------------------------------------------------

    word_count, character_count = (
        get_document_statistics(
            extracted_text
        )
    )

    if word_count < 3:
        raise HTTPException(
            status_code=422,
            detail=(
                "Not enough readable text was found "
                "to analyze this document. "
                "Please upload a clearer document."
            ),
        )

    # ---------------------------------------------------------
    # AI analysis
    # ---------------------------------------------------------

    try:
        analysis = analyze_document(
            text=extracted_text,
            summary_length=summary_length,
        )

    except AIProcessingError as exc:
        raise HTTPException(
            status_code=502,
            detail=str(exc),
        ) from exc

    # ---------------------------------------------------------
    # IMPORTANT
    #
    # The AI should NOT decide these technical metadata fields.
    # They come from our actual extraction pipeline.
    # ---------------------------------------------------------

    analysis = analysis.model_copy(
        update={
            "summary_length": summary_length,
            "processing_method": processing_method,
            "page_count": page_count,
            "word_count": word_count,
            "character_count": character_count,
            "processing_mode": (
                "direct"
                if word_count <= 5000
                else "chunked"
            ),
        }
    )

    return AnalysisResponse(
        document_type=analysis.document_type,
        summary=analysis.summary,
        key_points=analysis.key_points,
        main_ideas=analysis.main_ideas,
        topics=analysis.topics,
        improvement_suggestions=(
            analysis.improvement_suggestions
        ),
        confidence_note=analysis.confidence_note,
        summary_length=analysis.summary_length,
        processing_method=analysis.processing_method,
        page_count=analysis.page_count,
        word_count=analysis.word_count,
        character_count=analysis.character_count,
        processing_mode=analysis.processing_mode,
    )