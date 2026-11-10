import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getOrCreateUser } from "@/lib/user";
import { AI_FIELDS } from "@/lib/profileFields";
import type { ProfileDraftResult } from "@/lib/ai/extractProfile";
import { applyProfileDraft } from "@/app/actions";
import PageHeader from "@/components/PageHeader";
import Notice from "@/components/Notice";

export const dynamic = "force-dynamic";

export default async function RevisarPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { ok?: string; erro?: string };
}) {
  const user = await getOrCreateUser();
  const resume = await db.resume.findUnique({ where: { id: params.id, userId: user.id } });
  if (!resume) notFound();
  if (!resume.aiDraft) redirect("/curriculos");

  let draft: ProfileDraftResult;
  try {
    draft = JSON.parse(resume.aiDraft) as ProfileDraftResult;
  } catch {
    redirect("/curriculos");
  }


  return (
    <>
      <PageHeader
        title="Revisar dados sugeridos pela IA"
        subtitle={`Extraídos de "${resume.originalFileName}". Nada foi salvo no seu perfil ainda.`}
      />
      <Notice erro={searchParams.erro} />

      <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        A IA pode errar ou entender algo de forma diferente do que está no currículo. Confira cada campo
        com o seu PDF e corrija o que for preciso. Campos que a IA não encontrou mantêm o valor atual do
        seu perfil.
        {draft.warnings.length > 0 ? (
          <ul className="mt-2 list-disc pl-5">
            {draft.warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        ) : null}
      </div>

      <form action={applyProfileDraft} className="card space-y-4">
        <input type="hidden" name="resumeId" value={resume.id} />

        {AI_FIELDS.map((field) => {
          const suggested = draft.fields[field.name] ?? "";
          const current = user[field.name];
          const value = suggested || current;
          const showCurrent = Boolean(suggested && current && suggested !== current);

          return (
            <div key={field.name}>
              <label className="field-label" htmlFor={field.name}>{field.label}</label>
              {field.multiline ? (
                <textarea
                  id={field.name}
                  name={field.name}
                  rows={field.name === "experience" ? 7 : 3}
                  defaultValue={value}
                  className="field-input"
                />
              ) : (
                <input id={field.name} name={field.name} defaultValue={value} className="field-input" />
              )}
              {showCurrent ? (
                <p className="mt-1 whitespace-pre-wrap text-xs text-slate-500">
                  Valor atual no perfil (será substituído): {current}
                </p>
              ) : null}
            </div>
          );
        })}

        <div className="flex items-center gap-4 pt-2">
          <button type="submit" className="btn-primary">Aplicar ao meu perfil</button>
          <Link href="/curriculos" className="text-sm text-slate-600 underline">
            Descartar e voltar
          </Link>
        </div>
      </form>
    </>
  );
}
