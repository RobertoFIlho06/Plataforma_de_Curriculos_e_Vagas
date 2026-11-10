
export type PlatformLocation = {
  city: string;
  state: string;
  infojobsId?: string;
  glassdoorId?: string;
};

const knownLocations: PlatformLocation[] = [
  {
    city: "Santos",
    state: "SP",
    infojobsId: "5211292",
    glassdoorId: "2464116",
  },
];

export function normalizeLocation(
  value: string
): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function findPlatformLocation(
  city: string,
  state: string
): PlatformLocation | null {
  const normalizedCity = normalizeLocation(city);
  const normalizedState = state.trim().toUpperCase();

  return (
    knownLocations.find(
      (item) =>
        normalizeLocation(item.city) === normalizedCity &&
        item.state === normalizedState
    ) ?? null
  );
}

function slugify(value: string): string {
  return normalizeLocation(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function googleSiteSearch(
  domain: string,
  jobTitle: string,
  city: string,
  state: string
): string {
  const terms = [
    `site:${domain}`,
    jobTitle.trim(),
    city.trim(),
    state.trim(),
    "vagas emprego",
  ]
    .filter(Boolean)
    .join(" ");

  const url = new URL(
    "https://www.google.com/search"
  );

  url.searchParams.set("q", terms);

  return url.toString();
}

export function buildInfojobsUrl(
  jobTitle: string,
  city: string,
  state: string
): {
  url: string;
  locationApplied: boolean;
} {
  const location = findPlatformLocation(
    city,
    state
  );

  if (location?.infojobsId) {
    const url = new URL(
      "https://www.infojobs.com.br/empregos.aspx"
    );

    url.searchParams.set(
      "palabra",
      jobTitle.trim()
    );

    url.searchParams.set(
      "poblacion",
      location.infojobsId
    );

    return {
      url: url.toString(),
      locationApplied: true,
    };
  }

  if (city.trim() || state.trim()) {
    return {
      url: googleSiteSearch(
        "infojobs.com.br",
        jobTitle,
        city,
        state
      ),
      locationApplied: false,
    };
  }

  const url = new URL(
    "https://www.infojobs.com.br/empregos.aspx"
  );

  url.searchParams.set(
    "palabra",
    jobTitle.trim()
  );

  return {
    url: url.toString(),
    locationApplied: false,
  };
}

export function buildGlassdoorUrl(
  jobTitle: string,
  city: string,
  state: string
): {
  url: string;
  locationApplied: boolean;
} {
  const location = findPlatformLocation(
    city,
    state
  );

  const citySlug = slugify(city);
  const jobSlug = slugify(jobTitle);

  if (
    location?.glassdoorId &&
    citySlug &&
    jobSlug
  ) {
    const start = citySlug.length + 1;
    const end = start + jobSlug.length;

    return {
      url:
        "https://www.glassdoor.com.br/Vaga/" +
        `${citySlug}-${jobSlug}-vagas-` +
        `SRCH_IL.0,${citySlug.length}_` +
        `IC${location.glassdoorId}_KO${start},${end}.htm`,
      locationApplied: true,
    };
  }

  if (city.trim() || state.trim()) {
    return {
      url: googleSiteSearch(
        "glassdoor.com.br/Vaga/",
        jobTitle,
        city,
        state
      ),
      locationApplied: false,
    };
  }

  const url = new URL(
    "https://www.glassdoor.com.br/Vaga/jobs.htm"
  );

  url.searchParams.set(
    "sc.keyword",
    jobTitle.trim()
  );

  return {
    url: url.toString(),
    locationApplied: false,
  };
}
