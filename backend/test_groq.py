import os

from dotenv import load_dotenv

from app.services.ai_service import (
    AIProcessingError,
    analyze_document,
)


load_dotenv()


TEST_DOCUMENT = """
DocMind is an intelligent document analysis assistant.

The application accepts PDF documents and image files.
It extracts text using native PDF parsing or OCR for scanned
documents and images.

The extracted content can then be analyzed using an AI model.
Users can request short, medium, or long summaries.

The system also identifies key points, main ideas, topics,
and suggestions for improving the document.

DocMind is designed with a FastAPI backend and a React frontend.
"""


def main():
    print("=" * 60)
    print("DocMind - Groq Integration Test")
    print("=" * 60)

    print()

    print(
        "GROQ_API_KEY:",
        "configured"
        if os.getenv("GROQ_API_KEY")
        else "MISSING",
    )

    print(
        "GROQ_MODEL:",
        os.getenv(
            "GROQ_MODEL",
            "openai/gpt-oss-120b",
        ),
    )

    print()
    print("Sending test document to Groq...")
    print()

    try:
        result = analyze_document(
            text=TEST_DOCUMENT,
            summary_length="medium",
        )

        print("AI ANALYSIS SUCCESS")
        print("=" * 60)

        print()
        print("SUMMARY:")
        print(result.summary)

        print()
        print("KEY POINTS:")
        for index, point in enumerate(
            result.key_points,
            start=1,
        ):
            print(f"{index}. {point}")

        print()
        print("MAIN IDEAS:")
        for index, idea in enumerate(
            result.main_ideas,
            start=1,
        ):
            print(f"{index}. {idea}")

        print()
        print("TOPICS:")
        for index, topic in enumerate(
            result.topics,
            start=1,
        ):
            print(f"{index}. {topic}")

        print()
        print("IMPROVEMENT SUGGESTIONS:")
        for index, suggestion in enumerate(
            result.improvement_suggestions,
            start=1,
        ):
            print(f"{index}. {suggestion}")

        print()
        print("CONFIDENCE NOTE:")
        print(result.confidence_note)

        print()
        print("=" * 60)
        print("GROQ TEST PASSED")
        print("=" * 60)

    except AIProcessingError as exc:
        print()
        print("=" * 60)
        print("GROQ TEST FAILED")
        print("=" * 60)
        print()
        print("Error:")
        print(str(exc))

    except Exception as exc:
        print()
        print("=" * 60)
        print("UNEXPECTED ERROR")
        print("=" * 60)
        print()
        print(type(exc).__name__)
        print(str(exc))


if __name__ == "__main__":
    main()