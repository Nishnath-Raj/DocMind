import json
import os

from groq import Groq

from app.schemas.analysis import (
    ChunkAnalysis,
    DocumentAnalysis,
)


MODEL_NAME = os.getenv(
    "GROQ_MODEL",
    "openai/gpt-oss-120b",
)


SUMMARY_INSTRUCTIONS = {
    "short": (
        "Write a concise summary in approximately 2-4 sentences. "
        "Prioritize the document's purpose and most important conclusions."
    ),
    "medium": (
        "Write a balanced summary in approximately 1-2 paragraphs. "
        "Cover the purpose, major points, and important conclusions."
    ),
    "long": (
        "Write a detailed but focused summary in approximately "
        "3-5 paragraphs. Preserve important context, relationships, "
        "and conclusions without unnecessary repetition."
    ),
}


# Documents above this word count use chunked processing.
DIRECT_ANALYSIS_WORD_LIMIT = 5000

# Approximate chunk size.
CHUNK_WORD_LIMIT = 3500

# Small overlap helps preserve context between chunks.
CHUNK_OVERLAP = 250


class AIProcessingError(Exception):
    """Raised when AI analysis fails."""


def _get_client() -> Groq:

    api_key = os.getenv(
        "GROQ_API_KEY"
    )

    if not api_key:
        raise AIProcessingError(
            "GROQ_API_KEY is not configured."
        )

    return Groq(
        api_key=api_key
    )


def _create_json_response(
    client: Groq,
    system_prompt: str,
    user_prompt: str,
    schema: dict,
    schema_name: str,
):

    schema["additionalProperties"] = False

    try:

        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {
                    "role": "system",
                    "content": system_prompt,
                },
                {
                    "role": "user",
                    "content": user_prompt,
                },
            ],
            temperature=0.2,
            response_format={
                "type": "json_schema",
                "json_schema": {
                    "name": schema_name,
                    "strict": True,
                    "schema": schema,
                },
            },
        )

        content = (
            response.choices[0]
            .message
            .content
        )

        if not content:
            raise AIProcessingError(
                "The AI service returned an empty response."
            )

        return json.loads(content)

    except AIProcessingError:
        raise

    except json.JSONDecodeError as exc:
        raise AIProcessingError(
            "The AI service returned invalid structured data."
        ) from exc

    except Exception as exc:
        raise AIProcessingError(
            "Unable to analyze the document with the AI service."
        ) from exc


def _split_into_chunks(
    text: str,
) -> list[str]:

    words = text.split()

    if len(words) <= DIRECT_ANALYSIS_WORD_LIMIT:
        return [text]

    chunks: list[str] = []

    start = 0

    while start < len(words):

        end = min(
            start + CHUNK_WORD_LIMIT,
            len(words),
        )

        chunk = " ".join(
            words[start:end]
        )

        if chunk.strip():
            chunks.append(
                chunk
            )

        if end >= len(words):
            break

        start = max(
            end - CHUNK_OVERLAP,
            start + 1,
        )

    return chunks


def _analyze_chunk(
    client: Groq,
    chunk: str,
    chunk_number: int,
    total_chunks: int,
) -> ChunkAnalysis:

    system_prompt = """
You are DocMind's document extraction engine.

Analyze ONLY the supplied section of a larger document.

Rules:

1. Use only information present in the supplied section.
2. Never invent facts.
3. Preserve important factual details.
4. Identify the strongest points and ideas.
5. Keep the response concise.
6. Do not provide improvement suggestions here.
7. Do not attempt to reconstruct missing sections.
"""

    user_prompt = f"""
Analyze section {chunk_number} of {total_chunks}.

DOCUMENT SECTION:
-------------------------
{chunk}
-------------------------

Return the analysis using the supplied JSON schema.
"""

    data = _create_json_response(
        client=client,
        system_prompt=system_prompt,
        user_prompt=user_prompt,
        schema=ChunkAnalysis.model_json_schema(),
        schema_name="document_chunk_analysis",
    )

    return ChunkAnalysis.model_validate(
        data
    )


def _analyze_direct(
    client: Groq,
    text: str,
    summary_length: str,
) -> DocumentAnalysis:

    system_prompt = """
You are DocMind, an intelligent document analysis assistant.

Analyze documents accurately and conservatively.

Rules:

1. Use ONLY information present in the supplied document.
2. Never invent facts, names, dates, numbers, achievements,
   conclusions, or other factual claims.
3. First determine the most appropriate document type.
4. Identify the most important factual points.
5. Identify central ideas and themes.
6. Identify concise topics.
7. Provide useful improvement suggestions.
8. Suggestions MUST be appropriate for the detected document type.
9. If the document is a resume, focus suggestions on resume quality.
10. If it is a research paper, focus on research clarity and evidence.
11. If it is a business report, focus on clarity, decisions, and evidence.
12. If it is technical documentation, focus on completeness and usability.
13. If it is a legal document, do not provide legal advice.
14. If the source is ambiguous or poorly extracted, mention that
    limitation in confidence_note.
15. Avoid repeating identical information across fields.
16. Prefer concise, information-dense answers.
"""

    user_prompt = f"""
Analyze the following document.

SUMMARY REQUIREMENT:
{SUMMARY_INSTRUCTIONS[summary_length]}

Return the analysis according to the supplied JSON schema.

DOCUMENT:
-------------------------
{text}
-------------------------
"""

    data = _create_json_response(
        client=client,
        system_prompt=system_prompt,
        user_prompt=user_prompt,
        schema=DocumentAnalysis.model_json_schema(),
        schema_name="document_analysis",
    )

    return DocumentAnalysis.model_validate(
        data
    )


def _synthesize_chunks(
    client: Groq,
    chunk_results: list[ChunkAnalysis],
    summary_length: str,
) -> DocumentAnalysis:

    compiled_sections = []

    for index, result in enumerate(
        chunk_results,
        start=1,
    ):

        compiled_sections.append(
            f"""
SECTION {index}

SUMMARY:
{result.summary}

KEY POINTS:
{json.dumps(result.key_points, ensure_ascii=False)}

MAIN IDEAS:
{json.dumps(result.main_ideas, ensure_ascii=False)}

TOPICS:
{json.dumps(result.topics, ensure_ascii=False)}
"""
        )

    compiled_text = "\n".join(
        compiled_sections
    )

    system_prompt = """
You are DocMind's final document synthesis engine.

You are given structured analyses produced from sections of one
larger document.

Your job is to synthesize them into one accurate document analysis.

Rules:

1. Use ONLY information present in the supplied section analyses.
2. Never invent facts.
3. Resolve repeated information intelligently.
4. Determine the overall document type.
5. Produce a coherent document-level summary.
6. Extract the strongest overall key points.
7. Identify the central ideas of the complete document.
8. Identify concise overall topics.
9. Provide improvement suggestions appropriate to the document type.
10. If the document is a resume, suggest resume improvements.
11. If it is a research paper, suggest research/document improvements.
12. If it is a business report, suggest business communication improvements.
13. If it is technical documentation, suggest usability and completeness improvements.
14. Do not provide legal advice for legal documents.
15. Mention limitations when the available section analyses are incomplete.
16. Avoid duplicate points.
"""

    user_prompt = f"""
Synthesize the complete document.

SUMMARY REQUIREMENT:
{SUMMARY_INSTRUCTIONS[summary_length]}

SECTION ANALYSES:
=========================
{compiled_text}
=========================

Return the final document analysis using the supplied JSON schema.
"""

    data = _create_json_response(
        client=client,
        system_prompt=system_prompt,
        user_prompt=user_prompt,
        schema=DocumentAnalysis.model_json_schema(),
        schema_name="document_analysis",
    )

    return DocumentAnalysis.model_validate(
        data
    )


def analyze_document(
    text: str,
    summary_length: str,
) -> DocumentAnalysis:

    if not text.strip():
        raise AIProcessingError(
            "No readable text was found in this document."
        )

    if summary_length not in SUMMARY_INSTRUCTIONS:
        raise AIProcessingError(
            "Invalid summary length. "
            "Choose short, medium, or long."
        )

    client = _get_client()

    chunks = _split_into_chunks(
        text
    )

    # Small document → one AI request.
    if len(chunks) == 1:

        return _analyze_direct(
            client=client,
            text=text,
            summary_length=summary_length,
        )

    # Large document → analyze sections first.
    chunk_results: list[ChunkAnalysis] = []

    for index, chunk in enumerate(
        chunks,
        start=1,
    ):

        result = _analyze_chunk(
            client=client,
            chunk=chunk,
            chunk_number=index,
            total_chunks=len(chunks),
        )

        chunk_results.append(
            result
        )

    # Final AI request combines the section results.
    return _synthesize_chunks(
        client=client,
        chunk_results=chunk_results,
        summary_length=summary_length,
    )