"use client";

import { useState } from "react";

// Formulário que mostra uma mensagem de "aguarde" enquanto uma ação demorada roda
// (a IA local pode levar alguns minutos) e bloqueia cliques repetidos.
export default function PendingForm({
  action,
  pendingText,
  className,
  children,
}: {
  action: (formData: FormData) => void | Promise<void>;
  pendingText: string;
  className?: string;
  children: React.ReactNode;
}) {
  const [pending, setPending] = useState(false);

  return (
    <form action={action} onSubmit={() => setPending(true)} className={className}>
      <fieldset disabled={pending} className="contents">
        {children}
      </fieldset>
      {pending ? <div role="status" aria-live="polite" className="mt-3 rounded-lg border border-indigo-100 bg-indigo-50 p-3 text-sm text-indigo-800"><div className="flex items-center gap-2 font-medium"><span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" /> Processando com IA...</div><p className="mt-2">{pendingText}</p><p className="mt-1 text-xs">O progresso é indeterminado; não há porcentagem real disponível.</p></div> : null}
    </form>
  );
}
