// Campos do perfil que a IA consegue extrair de um currículo.
// (Áreas de interesse, modalidade e pretensão salarial não costumam estar no currículo,
// então ficam sempre por sua conta na tela "Meu perfil".)
export const AI_FIELDS = [
  { name: "fullName", label: "Nome completo", multiline: false },
  { name: "email", label: "E-mail", multiline: false },
  { name: "phone", label: "Telefone", multiline: false },
  { name: "linkedin", label: "LinkedIn (URL)", multiline: false },
  { name: "city", label: "Cidade", multiline: false },
  { name: "state", label: "Estado", multiline: false },
  { name: "education", label: "Formação acadêmica", multiline: true },
  { name: "experience", label: "Experiências profissionais", multiline: true },
  { name: "courses", label: "Cursos e certificações", multiline: true },
  { name: "technicalSkills", label: "Habilidades técnicas", multiline: true },
  { name: "softSkills", label: "Habilidades comportamentais", multiline: true },
] as const;

export type AiFieldName = (typeof AI_FIELDS)[number]["name"];
