export type SummaryLength =
  | "short"
  | "medium"
  | "long";

export type DocumentType =
  | "resume"
  | "research_paper"
  | "academic_document"
  | "business_report"
  | "technical_documentation"
  | "legal_document"
  | "article"
  | "general_document";

export type ProcessingMethod =
  | "native"
  | "ocr";

export type ProcessingMode =
  | "direct"
  | "chunked";

export interface DocumentAnalysis {
  document_type: DocumentType;

  summary: string;

  key_points: string[];

  main_ideas: string[];

  topics: string[];

  improvement_suggestions: string[];

  confidence_note: string;

  summary_length: SummaryLength;

  processing_method: ProcessingMethod;

  page_count: number | null;

  word_count: number;

  character_count: number;

  processing_mode: ProcessingMode;
}

/**
 * Final response returned by the analysis endpoint.
 */
export type AnalysisResponse =
  DocumentAnalysis;

/**
 * Response returned after the initial upload.
 */
export interface DocumentUploadResponse {
  filename: string;

  content_type: string;

  file_size: number;

  document_type: string;

  extraction_method: ProcessingMethod;

  extracted_text: string;

  page_count: number | null;

  word_count: number;

  character_count: number;
}