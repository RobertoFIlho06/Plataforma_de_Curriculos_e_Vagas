
"use client";

import {
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";

type Profile = {
  fullName: string;
  email: string;
  phone: string;
  linkedin: string;
  city: string;
  state: string;
  education: string;
  experience: string;
  courses: string;
  technicalSkills: string;
  softSkills: string;
  interestAreas: string;
  workMode: string;
  salaryExpectation: string;
};

type ProfileKey = keyof Profile;

type Props = {
  initialProfile: Profile;
  workModes: string[];
  saveAction: (formData: FormData) => void | Promise<void>;
};

function Icon({
  name,
  className = "h-4 w-4",
}: {
  name: "pencil" | "check" | "x" | "user" | "file";
  className?: string;
}) {
  const paths = {
    pencil: (
      <>
        <path d="m15 5 4 4" />
        <path d="M4 20l4.5-1 11-11a2.1 2.1 0 0 0-3-3l-11 11L4 20Z" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    x: <path d="M18 6 6 18M6 6l12 12" />,
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </>
    ),
    file: (
      <>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
        <path d="M14 2v6h6M8 13h8M8 17h8" />
      </>
    ),
  };

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

const inputClass =
  "w-full rounded-lg border border-[#cddfd3] bg-white px-3 py-2.5 text-sm text-[#243e30] outline-none transition focus:border-[#168466] focus:ring-2 focus:ring-[#168466]/10";

function EditInput({
  field,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  field: ProfileKey;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <input
      name={field}
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className={inputClass}
    />
  );
}

function ResumeSection({
  title,
  field,
  value,
  editing,
  onChange,
  placeholder,
  rows = 3,
}: {
  title: string;
  field: ProfileKey;
  value: string;
  editing: boolean;
  onChange: (value: string) => void;
  placeholder: string;
  rows?: number;
}) {
  if (!editing && !value.trim()) {
    return null;
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2 border-b border-[#e7eee9] pb-2">
        <div className="h-4 w-[3px] rounded-full bg-[#168466]" />

        <h2 className="text-xs font-extrabold uppercase tracking-[0.1em] text-[#173c2d]">
          {title}
        </h2>
      </div>

      {editing ? (
        <textarea
          name={field}
          rows={rows}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={`${inputClass} resize-y`}
        />
      ) : (
        <p className="whitespace-pre-wrap break-words text-sm leading-7 text-[#52665a]">
          {value}
        </p>
      )}
    </section>
  );
}

export default function CurriculoInterativo({
  initialProfile,
  workModes,
  saveAction,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] =
    useState<Profile>(initialProfile);

  const [savedProfile, setSavedProfile] =
    useState<Profile>(initialProfile);

  const [saveStatus, setSaveStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const [errorMessage, setErrorMessage] = useState("");

  const [isPending, startTransition] = useTransition();

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    setProfile(initialProfile);
    setSavedProfile(initialProfile);
  }, [initialProfile]);

  function update(key: ProfileKey, value: string) {
    setProfile((current) => ({
      ...current,
      [key]: value,
    }));

    if (saveStatus !== "idle") {
      setSaveStatus("idle");
    }
  }

  function cancelEditing() {
    setProfile(savedProfile);
    setEditing(false);
    setSaveStatus("idle");
    setErrorMessage("");
  }

  function beginEditing() {
    setEditing(true);
    setSaveStatus("idle");
    setErrorMessage("");
  }

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (isPending) return;

    const formData = new FormData(event.currentTarget);

    // Adiciona todos os campos, inclusive aqueles
    // que estiverem ocultos na visualização.
    (
      Object.keys(profile) as ProfileKey[]
    ).forEach((key) => {
      formData.set(key, profile[key]);
    });

    setSaveStatus("idle");
    setErrorMessage("");

    startTransition(async () => {
      try {
        await saveAction(formData);

        setSavedProfile({ ...profile });
        setEditing(false);
        setSaveStatus("success");
      } catch (error) {
        console.error(
          "Erro ao salvar o perfil:",
          error
        );

        setSaveStatus("error");
        setErrorMessage(
          "Não foi possível salvar as alterações. Verifique a conexão e tente novamente."
        );
      }
    });
  }

  const location = [
    profile.city,
    profile.state,
  ]
    .filter(Boolean)
    .join(", ");

  const hasProfile = Object.values(profile).some(
    (value) => value.trim().length > 0
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-[#e2ebe4] bg-white shadow-[0_4px_20px_rgba(20,64,42,0.045)]">
      {/* BARRA DE FERRAMENTAS */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e7eee9] bg-[#f8fbf9] px-5 py-4 md:px-7">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e9f6ef] text-[#168466]">
            <Icon name="file" className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-sm font-bold text-[#243e30]">
              Currículo profissional
            </h2>

            <p className="mt-0.5 text-xs text-[#819087]">
              {editing
                ? "Modo de edição ativado"
                : "Visualização do seu perfil"}
            </p>
          </div>
        </div>

        {editing ? (
          <button
            type="button"
            onClick={cancelEditing}
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-xl border border-[#dce6de] bg-white px-4 py-2.5 text-sm font-semibold text-[#52665a] transition hover:bg-[#f1f6f2] disabled:opacity-50"
          >
            <Icon name="x" />
            Cancelar
          </button>
        ) : (
          <button
            type="button"
            onClick={beginEditing}
            className="inline-flex items-center gap-2 rounded-xl bg-[#168466] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#106c52]"
          >
            <Icon name="pencil" />
            Editar currículo
          </button>
        )}
      </div>

      {/* MENSAGENS DE STATUS */}
      {saveStatus === "success" && !editing && (
        <div
          role="status"
          className="mx-5 mt-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 md:mx-7"
        >
          <Icon name="check" />
          Perfil salvo com sucesso!
        </div>
      )}

      {saveStatus === "error" && (
        <div
          role="alert"
          className="mx-5 mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 md:mx-7"
        >
          {errorMessage}
        </div>
      )}

      <form
        ref={formRef}
        onSubmit={handleSubmit}
      >
        {/* FOLHA DO CURRÍCULO */}
        <div className="mx-auto max-w-[850px] px-5 py-8 sm:px-10 md:px-14 md:py-12">
          {/* IDENTIFICAÇÃO */}
          <header className="text-center">
            {editing ? (
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-left text-xs font-semibold text-[#52665a]">
                    Nome completo
                  </label>

                  <EditInput
                    field="fullName"
                    value={profile.fullName}
                    onChange={(value) =>
                      update("fullName", value)
                    }
                    placeholder="Seu nome completo"
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-left text-xs font-semibold text-[#52665a]">
                      Cidade
                    </label>

                    <EditInput
                      field="city"
                      value={profile.city}
                      onChange={(value) =>
                        update("city", value)
                      }
                      placeholder="Cidade"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-left text-xs font-semibold text-[#52665a]">
                      Estado
                    </label>

                    <EditInput
                      field="state"
                      value={profile.state}
                      onChange={(value) =>
                        update("state", value)
                      }
                      placeholder="Estado"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-left text-xs font-semibold text-[#52665a]">
                      Telefone
                    </label>

                    <EditInput
                      field="phone"
                      value={profile.phone}
                      onChange={(value) =>
                        update("phone", value)
                      }
                      placeholder="Telefone"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-left text-xs font-semibold text-[#52665a]">
                      E-mail
                    </label>

                    <EditInput
                      field="email"
                      type="email"
                      value={profile.email}
                      onChange={(value) =>
                        update("email", value)
                      }
                      placeholder="E-mail"
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <label className="mb-1.5 block text-left text-xs font-semibold text-[#52665a]">LinkedIn (URL do perfil)</label>
                  <EditInput field="linkedin" type="url" value={profile.linkedin} onChange={(value) => update("linkedin", value)} placeholder="https://www.linkedin.com/in/seu-perfil" />
                </div>
              </div>
            ) : (
              <>
                <h1 className="break-words text-2xl font-extrabold tracking-tight text-[#173c2d] sm:text-3xl">
                  {profile.fullName ||
                    "Seu nome completo"}
                </h1>

                <div className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-[#718178]">
                  {location && (
                    <span>{location}</span>
                  )}

                  {profile.phone && (
                    <span>{profile.phone}</span>
                  )}

                  {profile.email && (
                    <span className="break-all">{profile.email}</span>
                  )}
                  {profile.linkedin && (
                    <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="break-all text-[#168466] underline">LinkedIn</a>
                  )}
                </div>
              </>
            )}
          </header>

          <div className="my-8 h-[2px] w-full rounded-full bg-[#168466]" />

          {!hasProfile && !editing && (
            <div className="mb-8 rounded-xl border border-dashed border-[#cddfd3] bg-[#f8fbf9] p-6 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#e9f6ef] text-[#168466]">
                <Icon
                  name="user"
                  className="h-6 w-6"
                />
              </div>

              <h3 className="text-sm font-bold text-[#243e30]">
                Seu currículo começa aqui
              </h3>

              <p className="mt-2 text-sm text-[#718178]">
                Clique em Editar currículo para
                cadastrar suas informações profissionais.
              </p>
            </div>
          )}

          {/* SEÇÕES DO CURRÍCULO */}
          <div className="space-y-8">
            <ResumeSection
              title="Formação acadêmica"
              field="education"
              value={profile.education}
              editing={editing}
              onChange={(value) =>
                update("education", value)
              }
              placeholder="Informe sua escolaridade e formação."
              rows={4}
            />

            <ResumeSection
              title="Experiência profissional"
              field="experience"
              value={profile.experience}
              editing={editing}
              onChange={(value) =>
                update("experience", value)
              }
              placeholder="Descreva suas experiências profissionais."
              rows={6}
            />

            <ResumeSection
              title="Cursos e certificações"
              field="courses"
              value={profile.courses}
              editing={editing}
              onChange={(value) =>
                update("courses", value)
              }
              placeholder="Informe seus cursos e certificados."
              rows={4}
            />

            <ResumeSection
              title="Habilidades técnicas"
              field="technicalSkills"
              value={profile.technicalSkills}
              editing={editing}
              onChange={(value) =>
                update("technicalSkills", value)
              }
              placeholder="Ex.: Excel, Word, PowerPoint, SQL..."
              rows={4}
            />

            <ResumeSection
              title="Habilidades comportamentais"
              field="softSkills"
              value={profile.softSkills}
              editing={editing}
              onChange={(value) =>
                update("softSkills", value)
              }
              placeholder="Ex.: Comunicação, organização, trabalho em equipe..."
              rows={4}
            />

            <ResumeSection
              title="Áreas de interesse"
              field="interestAreas"
              value={profile.interestAreas}
              editing={editing}
              onChange={(value) =>
                update("interestAreas", value)
              }
              placeholder="Ex.: Administrativo, Logística, Atendimento..."
              rows={3}
            />

            {/* MODALIDADE DE TRABALHO */}
            {(editing || profile.workMode) && (
              <section className="space-y-3">
                <div className="flex items-center gap-2 border-b border-[#e7eee9] pb-2">
                  <div className="h-4 w-[3px] rounded-full bg-[#168466]" />

                  <h2 className="text-xs font-extrabold uppercase tracking-[0.1em] text-[#173c2d]">
                    Modalidade de trabalho
                  </h2>
                </div>

                {editing ? (
                  <select
                    name="workMode"
                    value={profile.workMode}
                    onChange={(event) =>
                      update(
                        "workMode",
                        event.target.value
                      )
                    }
                    className={inputClass}
                  >
                    <option value="">
                      Não informar
                    </option>

                    {workModes.map((mode) => (
                      <option
                        key={mode}
                        value={mode}
                      >
                        {mode}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-sm text-[#52665a]">
                    {profile.workMode}
                  </p>
                )}
              </section>
            )}

            {/* PRETENSÃO SALARIAL */}
            {(editing ||
              profile.salaryExpectation) && (
              <section className="space-y-3">
                <div className="flex items-center gap-2 border-b border-[#e7eee9] pb-2">
                  <div className="h-4 w-[3px] rounded-full bg-[#168466]" />

                  <h2 className="text-xs font-extrabold uppercase tracking-[0.1em] text-[#173c2d]">
                    Pretensão salarial
                  </h2>
                </div>

                {editing ? (
                  <EditInput
                    field="salaryExpectation"
                    value={
                      profile.salaryExpectation
                    }
                    onChange={(value) =>
                      update(
                        "salaryExpectation",
                        value
                      )
                    }
                    placeholder="Ex.: A combinar"
                  />
                ) : (
                  <p className="text-sm text-[#52665a]">
                    {profile.salaryExpectation}
                  </p>
                )}
              </section>
            )}
          </div>
        </div>

        {/* RODAPÉ */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#e7eee9] bg-[#f8fbf9] px-5 py-4 md:px-7">
          <p className="text-xs leading-relaxed text-[#819087]">
            {editing
              ? "Revise suas informações antes de salvar."
              : "Informações utilizadas nas análises de vagas e na personalização de currículos."}
          </p>

          {editing && (
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#168466] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#106c52] disabled:cursor-wait disabled:opacity-60"
            >
              <Icon name="check" />

              {isPending
                ? "Salvando..."
                : "Salvar alterações"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
