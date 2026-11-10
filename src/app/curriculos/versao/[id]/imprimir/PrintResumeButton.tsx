"use client";

export default function PrintResumeButton() {
  return (
    <button type="button" onClick={() => window.print()} className="rounded-xl bg-[#168466] px-5 py-3 text-sm font-semibold text-white hover:bg-[#106c52]">
      Imprimir / Salvar como PDF
    </button>
  );
}
