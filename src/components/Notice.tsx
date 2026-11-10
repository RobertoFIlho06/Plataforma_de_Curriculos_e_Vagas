// Mensagem de sucesso ou erro vinda da URL (?ok=... ou ?erro=...)
export default function Notice({ ok, erro }: { ok?: string; erro?: string }) {
  if (!ok && !erro) return null;
  const isError = Boolean(erro);
  return (
    <div
      className={`mb-5 rounded-lg border px-4 py-3 text-sm ${
        isError
          ? "border-red-200 bg-red-50 text-red-800"
          : "border-emerald-200 bg-emerald-50 text-emerald-800"
      }`}
    >
      {isError ? erro : ok}
    </div>
  );
}
