import { notFound } from "next/navigation";
import { cleanResumeText } from "@/lib/resumeCleanup";
import { db } from "@/lib/db";
import { getOrCreateUser } from "@/lib/user";
import PrintResumeButton from "./PrintResumeButton";

export const dynamic = "force-dynamic";

type Props = { params: { id: string } };

function extractSections(content: string) {
  const headings = ["OBJETIVO PROFISSIONAL", "EXPERIÊNCIA PROFISSIONAL", "FORMAÇÃO, CURSOS E HABILIDADES"] as const;
  const result: Record<string, string> = {};
  let active = "";
  for (const line of content.split(/\r?\n/)) {
    const normalized = line.trim().toUpperCase().replace(/:$/, "");
    if (headings.some((heading) => heading === normalized)) {
      active = normalized;
      result[active] = "";
    } else if (active) {
      result[active] += line + "\n";
    }
  }
  return result;
}

function Section({ title, content }: { title: string; content: string }) {
  if (!content.trim()) return null;
  return (
    <section className="resume-print-section mb-5 break-inside-avoid">
      <h2 className="mb-2 border-b border-[#d5dfd8] pb-1 text-[10pt] font-bold uppercase tracking-wide text-[#173c2d]">{title}</h2>
      <p className="whitespace-pre-wrap break-words text-[10pt] leading-[1.55] text-[#26362d]">{cleanResumeText(content)}</p>
    </section>
  );
}

// O título da versão e os dados da vaga são metadados internos e nunca são impressos.
export default async function ImprimirCurriculoPage({ params }: Props) {
  const user = await getOrCreateUser();
  const version = await db.resumeVersion.findUnique({ where: { id: params.id, resume: { userId: user.id } } });
  if (!version) notFound();
  const cleanedContent = cleanResumeText(version.content);
  const sections = extractSections(cleanedContent);
  const hasStructuredContent = Object.keys(sections).length > 0;
  const contact = [user.city && user.state ? `${user.city}, ${user.state}` : user.city || user.state, user.phone, user.email].filter(Boolean);

  return (
    <main className="jobtriva-print-page min-h-screen bg-[#edf2ee] px-4 py-8 print:bg-white print:p-0">
      <div className="resume-print-toolbar mx-auto mb-5 flex max-w-[210mm] flex-wrap items-center justify-between gap-3 print:hidden">
        <a href="/curriculos" className="text-sm font-semibold text-[#168466] hover:underline">← Voltar aos currículos</a>
        <PrintResumeButton />
      </div>
      <article className="resume-print-document mx-auto min-h-[297mm] max-w-[210mm] bg-white px-8 py-12 text-[#24352b] shadow-lg sm:px-14 print:min-h-0 print:max-w-none print:p-0 print:shadow-none">
        <header className="mb-6 border-b-2 border-[#168466] pb-4 text-center">
          <h1 className="break-words text-[20pt] font-bold leading-tight text-[#173c2d]">{cleanResumeText(user.fullName || "Nome não cadastrado")}</h1>
          {contact.length > 0 && <p className="mt-2 break-words text-[9pt] text-[#52665a]">{contact.map(cleanResumeText).join("  |  ")}</p>}
          {user.linkedin && <p className="mt-1 break-all text-[9pt] text-[#52665a]">{cleanResumeText(user.linkedin)}</p>}
        </header>
        {hasStructuredContent ? (
          <>
            <Section title="Objetivo profissional" content={sections["OBJETIVO PROFISSIONAL"] ?? ""} />
            <Section title="Experiência profissional" content={sections["EXPERIÊNCIA PROFISSIONAL"] || user.experience} />
            <Section title="Formação, cursos e habilidades" content={sections["FORMAÇÃO, CURSOS E HABILIDADES"] || [user.education, user.courses, user.technicalSkills].filter(Boolean).join("\n")} />
          </>
        ) : (
          <>
            <Section title="Objetivo e qualificações" content={cleanedContent.replace(/^\s*(currículo personalizado|nome da vaga|vaga:)[^\n]*\n?/gim, "").trim()} />
            <Section title="Experiência profissional" content={user.experience} />
            <Section title="Formação acadêmica" content={user.education} />
            <Section title="Cursos e certificações" content={user.courses} />
            <Section title="Competências técnicas" content={user.technicalSkills} />
          </>
        )}
        <Section title="Competências comportamentais" content={user.softSkills} />
      </article>
    </main>
  );
}
