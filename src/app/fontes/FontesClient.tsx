
"use client";

import { useState } from "react";
import Link from "next/link";

const estados = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF",
  "ES", "GO", "MA", "MT", "MS", "MG",
  "PA", "PB", "PR", "PE", "PI", "RJ",
  "RN", "RS", "RO", "RR", "SC", "SP",
  "SE", "TO",
];

export default function FontesPage() {
  const [cargo, setCargo] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [modalidade, setModalidade] = useState("");
  const [nivel, setNivel] = useState("");
  const [contrato, setContrato] = useState("");
  const [pesquisou, setPesquisou] = useState(false);

  const localizacao = [cidade.trim(), estado]
    .filter(Boolean)
    .join(", ");

  const filtros = [
    cargo.trim(),
    localizacao,
    modalidade,
    nivel,
    contrato,
  ].filter(Boolean);

  const consulta = filtros.join(" ");

  // Indeed aceita pesquisa por cargo e localização.
  const indeedUrl = new URL(
    "https://br.indeed.com/jobs"
  );

  indeedUrl.searchParams.set(
    "q",
    [cargo, nivel, modalidade, contrato]
      .filter(Boolean)
      .join(" ")
  );

  if (localizacao) {
    indeedUrl.searchParams.set(
      "l",
      localizacao
    );
  }

  // Pesquisa direcionada ao InfoJobs.
  // O Google pode retornar resultados diferentes
  // dos filtros internos do InfoJobs.
  const infojobsUrl = new URL(
    "https://www.google.com/search"
  );

  infojobsUrl.searchParams.set(
    "q",
    `site:infojobs.com.br/vaga-de-emprego ${consulta}`
  );

  const googleUrl = new URL(
    "https://www.google.com/search"
  );

  googleUrl.searchParams.set(
    "q",
    `${consulta} vagas de emprego`
  );

  function buscar(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPesquisou(true);
  }

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-4 md:p-8">
      <div>
        <Link
          href="/vagas"
          className="text-sm font-medium text-indigo-600"
        >
          ← Voltar para vagas
        </Link>

        <h1 className="mt-4 text-3xl font-bold text-slate-900">
          Busca em múltiplas plataformas
        </h1>

        <p className="mt-2 text-slate-600">
          Pesquise oportunidades em diferentes
          sites de emprego usando os mesmos critérios.
        </p>
      </div>

      <form
        onSubmit={buscar}
        className="card space-y-5"
      >
        <h2 className="text-xl font-semibold">
          Filtros da pesquisa
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="field-label">
              Cargo ou palavra-chave *
            </label>
            <input
              className="field-input"
              value={cargo}
              onChange={(e) =>
                setCargo(e.target.value)
              }
              placeholder="Auxiliar administrativo"
              required
              minLength={2}
              maxLength={100}
            />
          </div>

          <div>
            <label className="field-label">
              Cidade
            </label>
            <input
              className="field-input"
              value={cidade}
              onChange={(e) =>
                setCidade(e.target.value)
              }
              placeholder="Santos"
              maxLength={100}
            />
          </div>

          <div>
            <label className="field-label">
              Estado
            </label>
            <select
              className="field-input"
              value={estado}
              onChange={(e) =>
                setEstado(e.target.value)
              }
            >
              <option value="">
                Todos os estados
              </option>
              {estados.map((uf) => (
                <option key={uf} value={uf}>
                  {uf}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="field-label">
              Modalidade
            </label>
            <select
              className="field-input"
              value={modalidade}
              onChange={(e) =>
                setModalidade(e.target.value)
              }
            >
              <option value="">Todas</option>
              <option value="presencial">
                Presencial
              </option>
              <option value="híbrido">
                Híbrido
              </option>
              <option value="remoto">
                Remoto
              </option>
            </select>
          </div>

          <div>
            <label className="field-label">
              Nível profissional
            </label>
            <select
              className="field-input"
              value={nivel}
              onChange={(e) =>
                setNivel(e.target.value)
              }
            >
              <option value="">Todos</option>
              <option value="jovem aprendiz">
                Jovem Aprendiz
              </option>
              <option value="estágio">
                Estágio
              </option>
              <option value="auxiliar">
                Auxiliar
              </option>
              <option value="assistente">
                Assistente
              </option>
              <option value="júnior">
                Júnior
              </option>
              <option value="pleno">
                Pleno
              </option>
              <option value="sênior">
                Sênior
              </option>
              <option value="gerente">
                Gerência
              </option>
            </select>
          </div>

          <div>
            <label className="field-label">
              Tipo de contratação
            </label>
            <select
              className="field-input"
              value={contrato}
              onChange={(e) =>
                setContrato(e.target.value)
              }
            >
              <option value="">Todos</option>
              <option value="CLT">CLT</option>
              <option value="PJ">PJ</option>
              <option value="estágio">
                Estágio
              </option>
              <option value="temporário">
                Temporário
              </option>
              <option value="aprendizagem">
                Aprendizagem
              </option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="btn-primary"
        >
          Buscar oportunidades
        </button>
      </form>

      {pesquisou && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">
            Plataformas disponíveis
          </h2>

          <p className="text-sm text-slate-600">
            Pesquisa: {consulta}
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            <article className="card space-y-3">
              <h3 className="text-lg font-bold">
                Indeed
              </h3>

              <p className="text-sm text-slate-600">
                Busca por cargo e localização,
                incluindo palavras-chave adicionais.
              </p>

              <a
                href={indeedUrl.toString()}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary inline-block"
              >
                Ver vagas no Indeed
              </a>
            </article>

            <article className="card space-y-3">
              <h3 className="text-lg font-bold">
                InfoJobs
              </h3>

              <p className="text-sm text-slate-600">
                Pesquisa direcionada a anúncios
                do InfoJobs por meio do Google.
              </p>

              <a
                href={infojobsUrl.toString()}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary inline-block"
              >
                Procurar no InfoJobs
              </a>
            </article>

            <article className="card space-y-3">
              <h3 className="text-lg font-bold">
                Outras plataformas
              </h3>

              <p className="text-sm text-slate-600">
                Busca geral por oportunidades
                com os critérios informados.
              </p>

              <a
                href={googleUrl.toString()}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary inline-block"
              >
                Buscar na internet
              </a>
            </article>

            <article className="card space-y-3">
              <h3 className="text-lg font-bold">
                Analisar com IA
              </h3>

              <p className="text-sm text-slate-600">
                Encontrou uma vaga interessante?
                Copie a descrição e cadastre-a
                no JobTriva para análise.
              </p>

              <Link
                href="/vagas"
                className="btn-primary inline-block"
              >
                Cadastrar vaga no JobTriva
              </Link>
            </article>
          </div>

          <p className="text-sm text-slate-500">
            Os sites externos podem interpretar
            os filtros de maneiras diferentes.
            Confira a localização e os requisitos
            diretamente no anúncio.
          </p>
        </section>
      )}
    </main>
  );
}
