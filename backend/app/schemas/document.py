from pydantic import BaseModel


class DocumentResponse(BaseModel):
    filename: str
    content_type: str
    file_size: int
    document_type: str
    extraction_method: str
    extracted_text: str
    page_count: int | None = None
    word_count: int
    character_count: int