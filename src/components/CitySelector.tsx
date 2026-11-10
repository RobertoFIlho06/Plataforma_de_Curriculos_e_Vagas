
"use client";

import { useEffect, useState } from "react";

type Municipio = {
  id: number;
  nome: string;
};

type Props = {
  initialCity?: string;
  initialState?: string;
};

export default function CitySelector({
  initialCity = "",
  initialState = "",
}: Props) {
  const [estado, setEstado] = useState(initialState);
  const [cidade, setCidade] = useState(initialCity);
  const [municipios, setMunicipios] = useState<
    Municipio[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function carregarMunicipios() {
      setMunicipios([]);
      setError("");

      if (!estado) {
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const response = await fetch(
          `/api/municipios?uf=${encodeURIComponent(estado)}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error("Erro ao carregar municípios.");
        }

        const data =
          (await response.json()) as Municipio[];

        if (!controller.signal.aborted) {
          setMunicipios(data);
        }
      } catch {
        if (!controller.signal.aborted) {
          setError(
            "Não foi possível carregar as cidades."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    carregarMunicipios();

    return () => controller.abort();
  }, [estado]);

  const estados = [
    ["", "Todos os estados"],
    ["AC", "Acre"],
    ["AL", "Alagoas"],
    ["AP", "Amapá"],
    ["AM", "Amazonas"],
    ["BA", "Bahia"],
    ["CE", "Ceará"],
    ["DF", "Distrito Federal"],
    ["ES", "Espírito Santo"],
    ["GO", "Goiás"],
    ["MA", "Maranhão"],
    ["MT", "Mato Grosso"],
    ["MS", "Mato Grosso do Sul"],
    ["MG", "Minas Gerais"],
    ["PA", "Pará"],
    ["PB", "Paraíba"],
    ["PR", "Paraná"],
    ["PE", "Pernambuco"],
    ["PI", "Piauí"],
    ["RJ", "Rio de Janeiro"],
    ["RN", "Rio Grande do Norte"],
    ["RS", "Rio Grande do Sul"],
    ["RO", "Rondônia"],
    ["RR", "Roraima"],
    ["SC", "Santa Catarina"],
    ["SP", "São Paulo"],
    ["SE", "Sergipe"],
    ["TO", "Tocantins"],
  ];

  return (
    <>
      <div>
        <label
          htmlFor="estado"
          className="field-label"
        >
          Estado
        </label>

        <select
          id="estado"
          name="estado"
          className="field-input"
          value={estado}
          onChange={(event) => {
            setEstado(event.target.value);
            setCidade("");
          }}
        >
          {estados.map(([uf, nome]) => (
            <option key={uf} value={uf}>
              {nome}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="cidade"
          className="field-label"
        >
          Cidade
        </label>

        <select
          id="cidade"
          name="cidade"
          className="field-input"
          value={cidade}
          disabled={!estado || loading || !!error}
          onChange={(event) =>
            setCidade(event.target.value)
          }
        >
          <option value="">
            {loading
              ? "Carregando cidades..."
              : !estado
                ? "Selecione um estado primeiro"
                : "Todas as cidades"}
          </option>

          {cidade &&
            !municipios.some(
              (item) => item.nome === cidade
            ) && (
              <option value={cidade}>
                {cidade}
              </option>
            )}

          {municipios.map((item) => (
            <option key={item.id} value={item.nome}>
              {item.nome}
            </option>
          ))}
        </select>

        {error && (
          <p
            role="alert"
            className="mt-1 text-xs text-red-600"
          >
            {error}
          </p>
        )}
      </div>
    </>
  );
}
