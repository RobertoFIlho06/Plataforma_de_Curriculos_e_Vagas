
import { NextRequest, NextResponse } from "next/server";

type MunicipioIBGE = {
  id: number;
  nome: string;
};

const UFS = new Set([
  "AC", "AL", "AP", "AM", "BA", "CE", "DF",
  "ES", "GO", "MA", "MT", "MS", "MG",
  "PA", "PB", "PR", "PE", "PI", "RJ",
  "RN", "RS", "RO", "RR", "SC", "SP",
  "SE", "TO",
]);

export async function GET(request: NextRequest) {
  const uf = (
    request.nextUrl.searchParams.get("uf") || ""
  ).toUpperCase();

  if (!UFS.has(uf)) {
    return NextResponse.json(
      { error: "Estado inválido." },
      { status: 400 }
    );
  }

  try {
    const url =
      "https://servicodados.ibge.gov.br" +
      `/api/v1/localidades/estados/${uf}/municipios`;

    const response = await fetch(url, {
      next: { revalidate: 86400 },
    });

    if (!response.ok) {
      throw new Error("Falha na consulta ao IBGE.");
    }

    const data =
      (await response.json()) as MunicipioIBGE[];

    const municipios = data
      .map((item) => ({
        id: item.id,
        nome: item.nome,
      }))
      .sort((a, b) =>
        a.nome.localeCompare(b.nome, "pt-BR")
      );

    return NextResponse.json(municipios);
  } catch {
    return NextResponse.json(
      {
        error:
          "Não foi possível carregar os municípios.",
      },
      { status: 502 }
    );
  }
}
