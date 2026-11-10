"use client";

import { useFormStatus } from "react-dom";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <>
      <button type="submit" disabled={pending} aria-busy={pending} className="btn-primary inline-flex items-center gap-2 disabled:cursor-wait disabled:opacity-70">
        {pending && <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
        {pending ? "Analisando com IA..." : label}
      </button>
      {pending && <div role="status" aria-live="polite" className="mt-3 rounded-lg border border-indigo-100 bg-indigo-50 p-3 text-sm text-indigo-800">
        <p className="font-medium">Análise em andamento</p>
        <p className="mt-1">O Ollama está processando os dados. O tempo depende do computador e do modelo. Aguarde o resultado.</p>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-indigo-100"><div className="h-full w-1/3 animate-pulse rounded-full bg-indigo-500" /></div>
        <p className="mt-2 text-xs">Progresso indeterminado: o modelo local não informa uma porcentagem confiável.</p>
      </div>}
    </>
  );
}

export default function AiPendingForm({ action, jobId, label }: { action: (data: FormData) => void | Promise<void>; jobId: string; label: string }) {
  return <form action={action}><input type="hidden" name="jobId" value={jobId} /><SubmitButton label={label} /></form>;
}
