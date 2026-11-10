
export type BrazilianState = {
  id: number;
  sigla: string;
  nome: string;
};

export type BrazilianCity = {
  id: number;
  nome: string;
  estado: string;
  estadoNome: string;
};

type IBGEState = {
  id: number;
  sigla: string;
  nome: string;
};

type IBGECity = {
  id: number;
  nome: string;
  microrregiao?: {
    mesorregiao?: {
      UF?: {
        sigla: string;
        nome: string;
      };
    };
  };
};

const API_BASE =
  "https://servicodados.ibge.gov.br/api/v1/localidades";

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export async function getBrazilianStates():
  Promise<BrazilianState[]> {
  const response = await fetch(
    `${API_BASE}/estados?orderBy=nome`,
    {
      next: { revalidate: 86400 },
    }
  );

  if (!response.ok) {
    throw new Error(
      "Não foi possível carregar os estados do IBGE."
    );
  }

  const data = (await response.json()) as IBGEState[];

  return data.map((state) => ({
    id: state.id,
    sigla: state.sigla,
    nome: state.nome,
  }));
}

export async function getBrazilianCities():
  Promise<BrazilianCity[]> {
  const response = await fetch(
    `${API_BASE}/municipios?orderBy=nome`,
    {
      next: { revalidate: 86400 },
    }
  );

  if (!response.ok) {
    throw new Error(
      "Não foi possível carregar os municípios do IBGE."
    );
  }

  const data = (await response.json()) as IBGECity[];

  return data.map((city) => ({
    id: city.id,
    nome: city.nome,
    estado:
      city.microrregiao?.mesorregiao?.UF?.sigla ?? "",
    estadoNome:
      city.microrregiao?.mesorregiao?.UF?.nome ?? "",
  }));
}

export async function findBrazilianCity(
  cityName: string,
  stateCode: string
): Promise<BrazilianCity | null> {
  if (!cityName.trim() || !stateCode.trim()) {
    return null;
  }

  const cities = await getBrazilianCities();

  const normalizedName = normalizeText(cityName);
  const normalizedState = stateCode.toUpperCase();

  return (
    cities.find(
      (city) =>
        normalizeText(city.nome) === normalizedName &&
        city.estado === normalizedState
    ) ?? null
  );
}

export async function getCitiesByState(
  stateCode: string
): Promise<BrazilianCity[]> {
  const cities = await getBrazilianCities();

  return cities.filter(
    (city) =>
      city.estado === stateCode.toUpperCase()
  );
}
