// Tela ainda não construída: diz com clareza em qual etapa ela chega (sem botões falsos)
export default function ComingSoon({ stage, children }: { stage: string; children: React.ReactNode }) {
  return (
    <div className="card">
      <p className="text-sm font-semibold text-indigo-600">Chega na {stage}</p>
      <div className="mt-2 space-y-2 text-sm text-slate-600">{children}</div>
    </div>
  );
}
