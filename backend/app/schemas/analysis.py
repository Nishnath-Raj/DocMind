from typing import Literal

from pydantic import BaseModel, Field


DocumentType = Literal[
    "resume",
    "research_paper",
    "academic_document",
    "business_report",
    "technical_documentation",
    "legal_document",
    "article",
    "general_document",
]


class DocumentAnalysis(BaseModel):
    document_type: DocumentType = Field(
        description=(
            "The most appropriate category for the document."
        )
    )

    summary: str = Field(
        description=(
            "A coherent summary of the document that captures "
            "its purpose, major points, and conclusions."
        )
    )

    key_points: list[str] = Field(
        description=(
            "The most important factual points from the document."
        )
    )

    main_ideas: list[str] = Field(
        description=(
            "The central ideas, arguments, or themes of the document."
        )
    )

    topics: list[str] = Field(
        description=(
            "Concise topic labels describing the document."
        )
    )

    improvement_suggestions: list[str] = Field(
        description=(
            "Actionable suggestions appropriate to the document type."
        )
    )

    confidence_note: str = Field(
        description=(
            "A short note describing limitations, ambiguity, "
            "or missing information detected in the source."
        )
    )


class ChunkAnalysis(BaseModel):
    summary: str = Field(
        description=(
            "A concise factual summary of this document section."
        )
    )

    key_points: list[str] = Field(
        description=(
            "Important factual points from this section."
        )
    )

    main_ideas: list[str] = Field(
        description=(
            "Important ideas or themes from this section."
        )
    )

    topics: list[str] = Field(
        description=(
            "Concise topics represented in this section."
        )
    )


class AnalysisResponse(DocumentAnalysis):
    summary_length: Literal[
        "short",
        "medium",
        "long",
    ]

    processing_method: Literal[
        "native",
        "ocr",
    ]

    page_count: int | None = None

    word_count: int

    character_count: int

    processing_mode: Literal[
        "direct",
        "chunked",
    ]