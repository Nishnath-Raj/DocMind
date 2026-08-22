import {
  FileText,
  Sparkles,
} from "lucide-react";

export default function Header() {
  return (
    <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-white shadow-sm">
            <FileText
              size={18}
              strokeWidth={2.2}
            />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[17px] font-bold tracking-tight text-slate-950">
                DocMind
              </span>

              <Sparkles
                size={13}
                className="text-indigo-500"
              />
            </div>

            <p className="hidden text-[10px] font-medium uppercase tracking-[0.18em] text-slate-400 sm:block">
              Document intelligence
            </p>
          </div>
        </div>

        <div className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500">
          AI-powered analysis
        </div>
      </div>
    </header>
  );
}