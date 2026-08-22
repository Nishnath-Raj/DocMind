import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  FileText,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";

import Header from "./components/Header";
import UploadZone from "./components/UploadZone";
import SummarySelector from "./components/SummarySelector";

import {
  analyzeDocument,
  uploadDocument,
} from "./services/api";

import type {
  AnalysisResponse,
  DocumentUploadResponse,
  SummaryLength,
} from "./types/analysis";

function App() {
  const [file, setFile] =
    useState<File | null>(null);

  const [uploading, setUploading] =
    useState(false);

  const [analyzing, setAnalyzing] =
    useState(false);

  const [uploadData, setUploadData] =
    useState<DocumentUploadResponse | null>(null);

  const [analysis, setAnalysis] =
    useState<AnalysisResponse | null>(null);

  const [summaryLength, setSummaryLength] =
    useState<SummaryLength>("medium");

  const [error, setError] =
    useState<string | null>(null);

  async function handleFileSelected(
    selectedFile: File,
  ) {
    setFile(selectedFile);
    setUploadData(null);
    setAnalysis(null);
    setError(null);
    setUploading(true);

    try {
      const result =
        await uploadDocument(selectedFile);

      setUploadData(result);
    } catch (err) {
      setFile(null);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to upload the document.",
      );
    } finally {
      setUploading(false);
    }
  }

  async function handleAnalyze() {
    if (!file) {
      setError(
        "Please select a document before analyzing.",
      );
      return;
    }

    setError(null);
    setAnalysis(null);
    setAnalyzing(true);

    try {
      const result =
        await analyzeDocument(
          file,
          summaryLength,
        );

      setAnalysis(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to analyze the document.",
      );
    } finally {
      setAnalyzing(false);
    }
  }

  function handleRemove() {
    setFile(null);
    setUploadData(null);
    setAnalysis(null);
    setError(null);
  }

  return (
    <div className="min-h-screen bg-[#f7f8fc] text-slate-950">
      <Header />

      <main className="mx-auto max-w-6xl px-5 pb-20 pt-12 sm:px-6 sm:pt-16">

        {/* Hero */}
        <section className="mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white px-3.5 py-1.5 text-xs font-semibold text-indigo-600 shadow-sm">
            <CheckCircle2 size={14} />
            Intelligent document analysis
          </div>

          <h1 className="text-4xl font-bold tracking-[-0.04em] text-slate-950 sm:text-6xl">
            Understand any document.
            <span className="block text-indigo-600">
              Instantly.
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-500 sm:text-lg">
            Upload a PDF or scanned document and let DocMind
            extract, summarize, and surface the ideas that matter.
          </p>
        </section>

        {/* Upload */}
        <section className="mx-auto mt-10 max-w-3xl">
          <UploadZone
            file={file}
            uploading={uploading || analyzing}
            error={error}
            onFileSelected={handleFileSelected}
            onRemove={handleRemove}
          />

          {/* Upload success */}
          {uploadData &&
            !uploading &&
            !analysis && (
              <div className="mt-5 space-y-5">

                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 text-emerald-600">
                      <CheckCircle2 size={18} />
                    </div>

                    <div>
                      <p className="text-sm font-bold text-emerald-800">
                        Document ready
                      </p>

                      <p className="mt-1 text-xs leading-5 text-emerald-700">
                        DocMind successfully extracted the document content.
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <Metadata
                      label="Type"
                      value={formatDocumentType(
                        uploadData.document_type,
                      )}
                    />

                    <Metadata
                      label="Pages"
                      value={
                        uploadData.page_count !== null
                          ? String(uploadData.page_count)
                          : "—"
                      }
                    />

                    <Metadata
                      label="Words"
                      value={uploadData.word_count.toLocaleString()}
                    />

                    <Metadata
                      label="Method"
                      value={formatProcessingMethod(
                        uploadData.extraction_method,
                      )}
                    />
                  </div>
                </div>

                {/* Analysis controls */}
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_20px_70px_-35px_rgba(15,23,42,0.25)] sm:p-6">

                  <SummarySelector
                    value={summaryLength}
                    onChange={setSummaryLength}
                    disabled={analyzing}
                  />

                  <button
                    type="button"
                    onClick={handleAnalyze}
                    disabled={analyzing}
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-slate-950/10 transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                  >
                    {analyzing ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Analyzing document...
                      </>
                    ) : (
                      <>
                        Analyze document
                        <ArrowRight size={17} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

          {/* Analysis result */}
          {analysis && (
            <AnalysisResults
              analysis={analysis}
              fileName={file?.name ?? "Document"}
              onReset={handleRemove}
            />
          )}

          {/* General error */}
          {error && !uploadData && (
            <div className="mt-5 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-red-700">
              <AlertCircle
                size={18}
                className="mt-0.5 shrink-0"
              />

              <p className="text-sm leading-6">
                {error}
              </p>
            </div>
          )}

          <div className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-400">
            <ShieldCheck size={14} />
            Your Groq API credentials never leave the backend.
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto mt-16 grid max-w-3xl gap-4 sm:grid-cols-3">
          <FeatureCard
            title="Extract"
            text="Native PDF parsing and OCR for scanned files."
          />

          <FeatureCard
            title="Understand"
            text="AI identifies the ideas and information that matter."
          />

          <FeatureCard
            title="Improve"
            text="Get contextual suggestions tailored to your document."
          />
        </section>
      </main>
    </div>
  );
}

function AnalysisResults({
  analysis,
  fileName,
  onReset,
}: {
  analysis: AnalysisResponse;
  fileName: string;
  onReset: () => void;
}) {
  return (
    <section className="mt-6 space-y-5">

      {/* Result header */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_70px_-35px_rgba(15,23,42,0.25)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-indigo-500">
              Analysis complete
            </p>

            <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950">
              {fileName}
            </h2>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
            <CheckCircle2 size={14} />
            {formatDocumentType(
              analysis.document_type,
            )}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Metadata
            label="Pages"
            value={
              analysis.page_count !== null
                ? String(analysis.page_count)
                : "—"
            }
          />

          <Metadata
            label="Words"
            value={analysis.word_count.toLocaleString()}
          />

          <Metadata
            label="Method"
            value={formatProcessingMethod(
              analysis.processing_method,
            )}
          />

          <Metadata
            label="Mode"
            value={formatProcessingMode(
              analysis.processing_mode,
            )}
          />
        </div>
      </div>

      {/* Summary */}
      <ResultCard
        title="Summary"
        eyebrow={`${analysis.summary_length} summary`}
      >
        <p className="text-sm leading-7 text-slate-600">
          {analysis.summary}
        </p>
      </ResultCard>

      {/* Key points */}
      <ResultCard title="Key points">
        <BulletList
          items={analysis.key_points}
        />
      </ResultCard>

      {/* Main ideas */}
      <ResultCard title="Main ideas">
        <BulletList
          items={analysis.main_ideas}
        />
      </ResultCard>

      {/* Topics */}
      <ResultCard title="Topics">
        <div className="flex flex-wrap gap-2">
          {analysis.topics.map(
            (topic, index) => (
              <span
                key={`${topic}-${index}`}
                className="rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700"
              >
                {topic}
              </span>
            ),
          )}
        </div>
      </ResultCard>

      {/* Improvement suggestions */}
      <ResultCard title="Improvement suggestions">
        <BulletList
          items={
            analysis.improvement_suggestions
          }
        />
      </ResultCard>

      {/* Confidence */}
      <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-5">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-amber-700">
          Confidence note
        </p>

        <p className="mt-2 text-sm leading-6 text-amber-800">
          {analysis.confidence_note}
        </p>
      </div>

      {/* Reset */}
      <button
        type="button"
        onClick={onReset}
        className="w-full rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
      >
        Analyze another document
      </button>
    </section>
  );
}

function ResultCard({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_70px_-35px_rgba(15,23,42,0.18)]">
      <div className="mb-4">
        {eyebrow && (
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.15em] text-indigo-500">
            {eyebrow}
          </p>
        )}

        <h3 className="text-lg font-bold tracking-tight text-slate-900">
          {title}
        </h3>
      </div>

      {children}
    </div>
  );
}

function BulletList({
  items,
}: {
  items: string[];
}) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-slate-400">
        No information was identified.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((item, index) => (
        <li
          key={`${item}-${index}`}
          className="flex items-start gap-3 text-sm leading-6 text-slate-600"
        >
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function Metadata({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 truncate text-sm font-bold text-slate-800">
        {value}
      </p>
    </div>
  );
}

function FeatureCard({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
        <FileText size={15} />
      </div>

      <p className="text-sm font-bold text-slate-900">
        {title}
      </p>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {text}
      </p>
    </div>
  );
}

function formatDocumentType(
  type: string,
): string {
  return type
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}

function formatProcessingMethod(
  method: string,
): string {
  if (method === "native") {
    return "Native PDF";
  }

  if (method === "ocr") {
    return "OCR";
  }

  return method;
}

function formatProcessingMode(
  mode: string,
): string {
  if (mode === "direct") {
    return "Direct";
  }

  if (mode === "chunked") {
    return "Chunked";
  }

  return mode;
}

export default App;