
"use client";

import { useState } from "react";
import { cleanResumeText, findSuspiciousResumeWords } from "@/lib/resumeCleanup";

import {
  generatePersonalizedResume,
  savePersonalizedResume,
} from "./personalizar-actions";

type ResumeOption = {
  id: string;
  name: string;
  hasText: boolean;
};

type JobOption = {
  id: string;
  title: string;
  company: string;
};

type Props = {
  resumes: ResumeOption[];
  jobs: JobOption[];
};

export default function PersonalizarCurriculo({
  resumes,
  jobs,
}: Props) {
  const [resumeId, setResumeId] = useState("");
  const [jobId, setJobId] = useState("");

  const [generatedResumeId, setGeneratedResumeId] =
    useState("");

  const [generatedJobId, setGeneratedJobId] =
    useState("");

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [generated, setGenerated] = useState(false);

  function resetGeneration() {
    setGenerated(false);
    setGeneratedResumeId("");
    setGeneratedJobId("");
    setTitle("");
    setContent("");
    setError("");
  }

  async function handleGenerate() {
    if (!resumeId || !jobId) {
      setError("Selecione um currículo e uma vaga.");
      return;
    }

    setLoading(true);
    resetGeneration();

    try {
      const result = await generatePersonalizedResume(
        resumeId,
        jobId
      );

      if (!result.success) {
        setError(
          result.error ?? "Erro ao gerar currículo."
        );
        return;
      }

      setTitle(result.title ?? "");
      setContent(cleanResumeText(result.content ?? ""));
      setGeneratedResumeId(resumeId);
      setGeneratedJobId(jobId);
      setGenerated(true);
    } catch {
      setError(
        "Não foi possível concluir a geração. Verifique o Ollama."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="card mb-8">
      <h2 className="text-lg font-semibold text-slate-900">
        Personalizar currículo com IA
      </h2>

      <p className="mt-2 text-sm text-slate-600">
        Selecione seu currículo original e uma vaga
        cadastrada. A IA criará uma versão adaptada
        aos requisitos da oportunidade.
      </p>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div>
          <label
            htmlFor="personalizar-resume"
            className="field-label"
          >
            Currículo original
          </label>

          <select
            id="personalizar-resume"
            className="field-input"
            value={resumeId}
            disabled={loading}
            onChange={(event) => {
              setResumeId(event.target.value);
              resetGeneration();
            }}
          >
            <option value="">
              Selecione um currículo
            </option>

            {resumes
              .filter((resume) => resume.hasText)
              .map((resume) => (
                <option
                  key={resume.id}
                  value={resume.id}
                >
                  {resume.name}
                </option>
              ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="personalizar-job"
            className="field-label"
          >
            Vaga desejada
          </label>

          <select
            id="personalizar-job"
            className="field-input"
            value={jobId}
            disabled={loading}
            onChange={(event) => {
              setJobId(event.target.value);
              resetGeneration();
            }}
          >
            <option value="">
              Selecione uma vaga
            </option>

            {jobs.map((job) => (
              <option
                key={job.id}
                value={job.id}
              >
                {job.title}
                {job.company
                  ? ` — ${job.company}`
                  : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      {resumes.length === 0 && (
        <p className="mt-4 text-sm text-amber-700">
          Envie primeiro um currículo em PDF.
        </p>
      )}

      {jobs.length === 0 && (
        <p className="mt-4 text-sm text-amber-700">
          Cadastre primeiro uma vaga na aba Vagas.
        </p>
      )}

      {error && (
        <div
          role="alert"
          className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={handleGenerate}
        disabled={loading || !resumeId || !jobId}
        className="btn-primary mt-5 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Gerando currículo com IA..." : "Gerar currículo personalizado"}
      </button>

      {loading && (
        <div role="status" aria-live="polite" className="mt-3 rounded-lg border border-indigo-100 bg-indigo-50 p-4 text-sm text-indigo-800">
          <p className="flex items-center gap-2 font-semibold"><span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" /> Gerando currículo com IA...</p>
          <p className="mt-2">O Ollama está preparando seu currículo. Isso pode levar alguns minutos. Aguarde o resultado.</p>
          <p className="mt-2 text-xs">Progresso indeterminado: não exibimos uma porcentagem inventada.</p>
        </div>
      )}

      {generated && (
        <form
          action={savePersonalizedResume}
          className="mt-6 space-y-4 border-t border-slate-200 pt-5"
        >
          <input
            type="hidden"
            name="resumeId"
            value={generatedResumeId}
          />

          <input
            type="hidden"
            name="jobId"
            value={generatedJobId}
          />

          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Revisar currículo gerado
            </h3>

            <p className="mt-2 text-sm text-slate-600">
              Confira cuidadosamente as informações
              antes de salvar. Você pode editar
              qualquer parte do texto.
            </p>
          </div>

          <div>
            <label
              htmlFor="generated-title"
              className="field-label"
            >
              Nome da versão
            </label>

            <input
              id="generated-title"
              name="title"
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              className="field-input"
              maxLength={150}
              required
            />
          </div>

          <div>
            <label
              htmlFor="generated-content"
              className="field-label"
            >
              Conteúdo do currículo
            </label>

            <textarea
              id="generated-content"
              name="content"
              value={content}
              onChange={(event) =>
                setContent(event.target.value)
              }
              className="field-input min-h-96 font-mono text-sm"
              maxLength={30000}
              required
            />
          </div>

          {findSuspiciousResumeWords(content).length > 0 && (
            <div role="status" className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              <p className="font-semibold">Confira possíveis erros de escrita antes de salvar:</p>
              <p className="mt-1 break-words">{findSuspiciousResumeWords(content).join(", ")}</p>
              <p className="mt-1 text-xs">Não corrigimos automaticamente palavras ambíguas para evitar alterar nomes e informações verdadeiras.</p>
            </div>
          )}
          <button type="button" className="text-sm font-medium text-indigo-700 underline" onClick={() => setContent(cleanResumeText(content))}>Limpar símbolos e espaços do texto</button>
          <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
            A IA pode cometer erros. Confira datas,
            experiências, cursos e habilidades.
            Salve somente informações verdadeiras.
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={!title.trim() || !content.trim()}
          >
            Salvar currículo personalizado
          </button>
        </form>
      )}
    </section>
  );
}
