
import { getOrCreateUser } from "@/lib/user";
import { saveProfile } from "../actions";
import { WORK_MODES } from "@/lib/constants";
import CurriculoInterativo from "./CurriculoInterativo";

export const dynamic = "force-dynamic";

type SearchParams = {
  ok?: string | string[];
  erro?: string | string[];
};

function first(value?: string | string[]): string {
  return typeof value === "string" ? value : "";
}

export default async function PerfilPage({
  searchParams,
}: {
  searchParams?: SearchParams | Promise<SearchParams>;
}) {
  const user = await getOrCreateUser();
  const params = (await searchParams) ?? {};

  return (
    <div className="space-y-6 pb-10">
      <div>
        <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#168466]">
          Informações profissionais
        </p>

        <h1 className="text-3xl font-bold tracking-tight text-[#1c2924]">
          Meu perfil
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#718178]">
          Visualize seu perfil como um currículo profissional.
          Edite suas informações quando precisar e mantenha
          seus dados atualizados para as análises com IA.
        </p>
      </div>

      {first(params.ok) && (
        <div
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800"
        >
          {first(params.ok)}
        </div>
      )}

      {first(params.erro) && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700"
        >
          {first(params.erro)}
        </div>
      )}

      <CurriculoInterativo
        initialProfile={{
          fullName: user.fullName ?? "",
          email: user.email ?? "",
          phone: user.phone ?? "",
          linkedin: user.linkedin ?? "",
          city: user.city ?? "",
          state: user.state ?? "",
          education: user.education ?? "",
          experience: user.experience ?? "",
          courses: user.courses ?? "",
          technicalSkills: user.technicalSkills ?? "",
          softSkills: user.softSkills ?? "",
          interestAreas: user.interestAreas ?? "",
          workMode: user.workMode ?? "",
          salaryExpectation: user.salaryExpectation ?? "",
        }}
        workModes={[...WORK_MODES]}
        saveAction={saveProfile}
      />
    </div>
  );
}
