import type {
  DocumentAnalysis,
  DocumentUploadResponse,
  SummaryLength,
} from "../types/analysis";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:8000";

/**
 * Safely parse a backend response.
 */
async function parseResponse(
  response: Response,
): Promise<unknown> {
  const contentType =
    response.headers.get("content-type") ?? "";

  if (
    contentType
      .toLowerCase()
      .includes("application/json")
  ) {
    return response.json();
  }

  const text = await response.text();

  return {
    detail:
      text ||
      "The server returned an unexpected response.",
  };
}

/**
 * Convert unknown errors into a user-friendly message.
 */
function getErrorMessage(
  error: unknown,
): string {
  if (error instanceof TypeError) {
    return (
      "Unable to connect to the DocMind backend. " +
      "Make sure FastAPI is running on http://localhost:8000."
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return (
    "Something went wrong while communicating " +
    "with the server."
  );
}

/**
 * Extract FastAPI's error detail safely.
 */
function getApiErrorMessage(
  data: unknown,
  fallback: string,
): string {
  if (
    typeof data === "object" &&
    data !== null &&
    "detail" in data
  ) {
    const detail = (
      data as {
        detail?: unknown;
      }
    ).detail;

    if (typeof detail === "string") {
      return detail;
    }

    if (Array.isArray(detail)) {
      const messages = detail
        .map((item) => {
          if (
            typeof item === "object" &&
            item !== null &&
            "msg" in item
          ) {
            const message = (
              item as {
                msg?: unknown;
              }
            ).msg;

            return typeof message === "string"
              ? message
              : null;
          }

          return null;
        })
        .filter(
          (
            message,
          ): message is string =>
            message !== null,
        );

      if (messages.length > 0) {
        return messages.join(" ");
      }
    }
  }

  return fallback;
}

// =========================================================
// Health Check
// =========================================================

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/health`,
    );

    return response.ok;
  } catch {
    return false;
  }
}

// =========================================================
// Upload Document
// =========================================================

export async function uploadDocument(
  file: File,
): Promise<DocumentUploadResponse> {
  if (!file) {
    throw new Error(
      "Please select a document to upload.",
    );
  }

  const formData = new FormData();

  formData.append("file", file);

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/documents/upload`,
      {
        method: "POST",
        body: formData,
      },
    );

    const data = await parseResponse(response);

    if (!response.ok) {
      throw new Error(
        getApiErrorMessage(
          data,
          "Document upload failed.",
        ),
      );
    }

    return data as DocumentUploadResponse;
  } catch (error) {
    if (
      error instanceof Error &&
      !(error instanceof TypeError)
    ) {
      throw error;
    }

    throw new Error(
      getErrorMessage(error),
      {
        cause: error,
      },
    );
  }
}

// =========================================================
// Analyze Document
// =========================================================

/**
 * Analyze a PDF or image.
 *
 * IMPORTANT:
 * The backend expects multipart/form-data:
 *
 * file
 * summary_length
 *
 * Do NOT send JSON or extracted text here.
 */
export async function analyzeDocument(
  file: File,
  summaryLength: SummaryLength,
): Promise<DocumentAnalysis> {
  if (!file) {
    throw new Error(
      "Please select a document to analyze.",
    );
  }

  const formData = new FormData();

  formData.append("file", file);
  formData.append(
    "summary_length",
    summaryLength,
  );

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/documents/analyze`,
      {
        method: "POST",
        body: formData,
      },
    );

    const data = await parseResponse(response);

    if (!response.ok) {
      throw new Error(
        getApiErrorMessage(
          data,
          "Document analysis failed.",
        ),
      );
    }

    return data as DocumentAnalysis;
  } catch (error) {
    if (
      error instanceof Error &&
      !(error instanceof TypeError)
    ) {
      throw error;
    }

    throw new Error(
      getErrorMessage(error),
      {
        cause: error,
      },
    );
  }
}