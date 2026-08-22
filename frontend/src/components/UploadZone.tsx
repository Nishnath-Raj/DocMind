import {
  FileText,
  Image as ImageIcon,
  Loader2,
  UploadCloud,
  X,
} from "lucide-react";

import {
  useRef,
  useState,
} from "react";

import type {
  ChangeEvent,
  DragEvent,
} from "react";

interface UploadZoneProps {
  file: File | null;

  uploading: boolean;

  error: string | null;

  onFileSelected: (
    file: File,
  ) => void;

  onRemove: () => void;
}

const MAX_FILE_SIZE =
  10 * 1024 * 1024;

const ACCEPTED_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
];

function validateFile(
  file: File,
): string | null {
  if (
    !ACCEPTED_TYPES.includes(
      file.type,
    )
  ) {
    return (
      "Unsupported file type. " +
      "Please upload a PDF, PNG, or JPG file."
    );
  }

  if (
    file.size > MAX_FILE_SIZE
  ) {
    return (
      "File is too large. " +
      "Please upload a file smaller than 10 MB."
    );
  }

  if (file.size === 0) {
    return "This file appears to be empty.";
  }

  return null;
}

export default function UploadZone({
  file,
  uploading,
  error,
  onFileSelected,
  onRemove,
}: UploadZoneProps) {
  const inputRef =
    useRef<HTMLInputElement>(null);

  const [dragging, setDragging] =
    useState(false);

  const [localError, setLocalError] =
    useState<string | null>(null);

  function handleFile(
    fileToCheck: File,
  ) {
    const validationError =
      validateFile(fileToCheck);

    if (validationError) {
      setLocalError(
        validationError,
      );

      return;
    }

    setLocalError(null);

    onFileSelected(
      fileToCheck,
    );
  }

  function handleInputChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const selectedFile =
      event.target.files?.[0];

    if (selectedFile) {
      handleFile(
        selectedFile,
      );
    }

    event.target.value = "";
  }

  function handleDrop(
    event: DragEvent<HTMLDivElement>,
  ) {
    event.preventDefault();

    setDragging(false);

    if (uploading) {
      return;
    }

    const droppedFile =
      event.dataTransfer.files?.[0];

    if (droppedFile) {
      handleFile(
        droppedFile,
      );
    }
  }

  const displayError =
    localError || error;

  if (file) {
    const isPdf =
      file.type ===
      "application/pdf";

    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_20px_70px_-35px_rgba(15,23,42,0.35)]">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            {isPdf ? (
              <FileText size={22} />
            ) : (
              <ImageIcon size={22} />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-slate-900">
              {file.name}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {formatFileSize(
                file.size,
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={onRemove}
            disabled={uploading}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Remove file"
          >
            <X size={17} />
          </button>
        </div>

        {uploading && (
          <div className="mt-5 rounded-xl bg-slate-50 p-4">
            <div className="flex items-center gap-3">
              <Loader2
                size={18}
                className="animate-spin text-indigo-600"
              />

              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-700">
                  Reading your document...
                </p>

                <p className="mt-0.5 text-xs text-slate-400">
                  Extracting text and document metadata
                </p>
              </div>
            </div>

            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200">
              <div className="h-full w-2/3 animate-pulse rounded-full bg-indigo-500" />
            </div>
          </div>
        )}

        {displayError && (
          <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            {displayError}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div
        onDragEnter={(event) => {
          event.preventDefault();

          if (!uploading) {
            setDragging(true);
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();

          if (!uploading) {
            setDragging(true);
          }
        }}
        onDragLeave={(event) => {
          event.preventDefault();

          setDragging(false);
        }}
        onDrop={handleDrop}
        onClick={() => {
          if (!uploading) {
            inputRef.current?.click();
          }
        }}
        className={[
          "group cursor-pointer overflow-hidden rounded-3xl border-2 border-dashed bg-white p-2 transition-all duration-200",
          dragging
            ? "border-indigo-500 bg-indigo-50/40 shadow-lg shadow-indigo-500/10"
            : "border-slate-200 hover:border-indigo-300 hover:shadow-[0_20px_70px_-35px_rgba(15,23,42,0.35)]",
        ].join(" ")}
      >
        <div className="rounded-[22px] px-6 py-16 text-center sm:px-12">
          <div
            className={[
              "mx-auto flex h-16 w-16 items-center justify-center rounded-2xl transition",
              dragging
                ? "bg-indigo-600 text-white"
                : "bg-indigo-50 text-indigo-600 group-hover:scale-105",
            ].join(" ")}
          >
            <UploadCloud
              size={27}
              strokeWidth={2}
            />
          </div>

          <h2 className="mt-6 text-xl font-bold text-slate-900">
            {dragging
              ? "Drop it here"
              : "Drop your document here"}
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            or click to browse files
          </p>

          <div className="mt-7 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-950/10">
            <FileText size={17} />
            Choose a document
          </div>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <FileText size={13} />
              PDF
            </span>

            <span>•</span>

            <span className="inline-flex items-center gap-1.5">
              <ImageIcon size={13} />
              PNG / JPG
            </span>

            <span>•</span>

            <span>Max 10 MB</span>
          </div>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
        onChange={
          handleInputChange
        }
        className="hidden"
      />

      {displayError && (
        <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          {displayError}
        </div>
      )}
    </div>
  );
}

function formatFileSize(
  bytes: number,
): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (
    bytes <
    1024 * 1024
  ) {
    return `${(
      bytes / 1024
    ).toFixed(1)} KB`;
  }

  return `${(
    bytes /
    (1024 * 1024)
  ).toFixed(2)} MB`;
}