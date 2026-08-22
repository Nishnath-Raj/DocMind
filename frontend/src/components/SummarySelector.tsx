import {
  Check,
  Clock3,
} from "lucide-react";

import type {
  SummaryLength,
} from "../types/analysis";

interface SummarySelectorProps {
  value: SummaryLength;

  onChange: (
    value: SummaryLength,
  ) => void;

  disabled?: boolean;
}

const OPTIONS: {
  value: SummaryLength;
  label: string;
  description: string;
}[] = [
  {
    value: "short",
    label: "Short",
    description: "Quick overview",
  },
  {
    value: "medium",
    label: "Medium",
    description: "Balanced summary",
  },
  {
    value: "long",
    label: "Long",
    description: "Detailed analysis",
  },
];

export default function SummarySelector({
  value,
  onChange,
  disabled = false,
}: SummarySelectorProps) {
  return (
    <div>
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <Clock3
            size={16}
            className="text-indigo-600"
          />

          <h3 className="text-sm font-bold text-slate-900">
            Summary length
          </h3>
        </div>

        <p className="mt-1 text-xs text-slate-500">
          Choose how detailed you want the AI analysis to be.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {OPTIONS.map((option) => {
          const selected =
            value === option.value;

          return (
            <button
              key={option.value}
              type="button"
              disabled={disabled}
              onClick={() =>
                onChange(
                  option.value,
                )
              }
              className={[
                "relative rounded-xl border p-4 text-left transition-all",
                "disabled:cursor-not-allowed disabled:opacity-50",
                selected
                  ? "border-indigo-500 bg-indigo-50 shadow-sm"
                  : "border-slate-200 bg-white hover:border-indigo-200 hover:bg-slate-50",
              ].join(" ")}
            >
              {selected && (
                <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white">
                  <Check size={12} />
                </div>
              )}

              <p className="text-sm font-bold text-slate-900">
                {option.label}
              </p>

              <p className="mt-1 pr-5 text-xs text-slate-500">
                {option.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}