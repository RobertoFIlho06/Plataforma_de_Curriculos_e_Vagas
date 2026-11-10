import { requireAccount } from "@/lib/access";

import {
  deleteAllData,
  saveAiModel,
} from "../actions";

import {
  getActiveModel,
  getProvider,
} from "@/lib/ai";

import PageHeader from "@/components/PageHeader";
import Notice from "@/components/Notice";

export const dynamic = "force-dynamic";

export default async function ConfiguracoesPage({
  searchParams,
}: {
  searchParams: {
    ok?: string;
    erro?: string;
  };
}) {
  const owner = await requireAccount();

  // Obtém o provedor de inteligência artificial.
  const provider = getProvider();

  // Verifica a configuração do provedor selecionado.
  const status = await provider.check();

  // Garante que a lista de modelos seja sempre um array.
  // Isso evita erros com .map() e .includes().
  const availableModels: string[] = Array.isArray(
    status.models
  )
    ? status.models
    : [];

  // Obtém o modelo selecionado nas configurações.
  const activeModel = await getActiveModel(
    availableModels,
    owner.id
  );

  // Só permite selecionar modelos quando a conexão
  // está ativa e existe pelo menos um modelo disponível.
  const canSelectModel =
    status.ok && availableModels.length > 0;
  const isExternal = provider.id === "external";

  return (
    <>
      <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#168466]">PREFERÊNCIAS DO SISTEMA</p>
      <PageHeader title="Configurações" />

      <Notice
        ok={searchParams.ok}
        erro={searchParams.erro}
      />

      {/* CONFIGURAÇÕES DA INTELIGÊNCIA ARTIFICIAL */}
      <section className="card mb-6 rounded-2xl border-[#e2ebe4] bg-white shadow-[0_4px_20px_rgba(20,64,42,0.045)]">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-bold text-[#1c2924]">
            Inteligência artificial ({provider.label})
          </h2>

          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              canSelectModel
                ? "bg-emerald-50 text-emerald-700"
                : "bg-amber-50 text-amber-800"
            }`}
          >
            {canSelectModel
              ? "Conectada"
              : status.ok
                ? "Sem modelos disponíveis"
                : "Indisponível"}
          </span>
        </div>

        {canSelectModel ? (
          <form
            action={saveAiModel}
            className="mt-4 flex flex-col gap-3 md:flex-row md:items-end"
          >
            <div className="flex-1">
              <label
                className="field-label"
                htmlFor="model"
              >
                Modelo usado pelo JobTriva
              </label>

              <select
                id="model"
                name="model"
                defaultValue={activeModel ?? ""}
                className="field-input"
              >
                {availableModels.map((model) => (
                  <option
                    key={model}
                    value={model}
                  >
                    {model}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="btn-primary"
            >
              Salvar modelo
            </button>
          </form>
        ) : (
          <div className="mt-3 space-y-3 text-sm text-[#718178]">
            <p>
              {status.ok
                ? "O provedor não retornou modelos disponíveis."
                : status.message ||
                  "Não foi possível configurar o provedor de IA."}
            </p>

            <p className="font-medium text-slate-800">
              Para configurar a IA:
            </p>

            {isExternal ? (
              <p>Configure AI_PROVIDER, AI_API_KEY e AI_API_MODEL no ambiente seguro do servidor. A seleção do provedor é administrativa, não individual. A chave nunca deve aparecer no navegador.</p>
            ) : (
            <ol className="list-decimal space-y-2 pl-5">
              <li>
                Verifique se o Ollama está instalado
                e em execução no computador.
              </li>

              <li>
                Abra um terminal e confira os modelos
                instalados:
                <div className="mt-2">
                  <code className="rounded bg-slate-100 px-2 py-1">
                    ollama list
                  </code>
                </div>
              </li>

              <li>
                Se não houver nenhum modelo instalado,
                você pode instalar um executando:
                <div className="mt-2">
                  <code className="rounded bg-slate-100 px-2 py-1">
                    ollama pull llama3.2
                  </code>
                </div>
              </li>

              <li>
                Atualize esta página depois de verificar
                o Ollama.
              </li>
            </ol>
            )}

            <p>
              O restante do JobTriva continua funcionando
              normalmente sem a inteligência artificial.
            </p>
          </div>
        )}
      </section>

      {/* INFORMAÇÕES SOBRE ARMAZENAMENTO */}
      <section className="card mb-6 rounded-2xl border-[#e2ebe4] bg-white shadow-[0_4px_20px_rgba(20,64,42,0.045)]">
        <h2 className="font-bold text-[#1c2924]">
          Armazenamento e privacidade
        </h2>

        <p className="mt-2 text-sm text-[#718178]">
          No desenvolvimento local, o banco e os currículos são armazenados no ambiente configurado. Na publicação, serão necessários armazenamento persistente, backups e políticas de acesso.
        </p>

        <p className="mt-2 text-sm text-[#718178]">
          {isExternal
            ? "Ao usar a API externa, textos de currículos e vagas poderão ser enviados ao provedor configurado. Verifique suas políticas de privacidade antes de ativar esse recurso."
            : "Com Ollama local, o processamento da IA ocorre no servidor local configurado, sem necessidade de enviar o texto a uma API externa."}
        </p>

        <p className="mt-2 text-sm text-[#718178]">
          O JobTriva não guarda senhas de sites de
          emprego e não envia candidaturas sozinho.
        </p>
      </section>

      {/* EXCLUSÃO DOS DADOS */}
      <section className="card rounded-2xl border-red-200 bg-white shadow-[0_4px_20px_rgba(20,64,42,0.045)]">
        <h2 className="font-semibold text-red-700">
          Excluir todos os meus dados
        </h2>

        <p className="mt-2 text-sm text-[#718178]">
          Apaga perfil, currículos (inclusive os
          arquivos PDF), vagas, análises e
          candidaturas. Não dá para desfazer.
        </p>

        <form
          action={deleteAllData}
          className="mt-4 space-y-3"
        >
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              name="confirm"
              required
              className="h-4 w-4"
            />

            Entendo que isso apaga tudo de forma
            definitiva.
          </label>

          <button
            type="submit"
            className="btn-danger"
          >
            Excluir tudo
          </button>
        </form>
      </section>
    </>
  );
}
