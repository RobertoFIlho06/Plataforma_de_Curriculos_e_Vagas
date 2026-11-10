// Status das candidaturas (guardados no banco como texto)
export const APPLICATION_STATUS = {
  FOUND: "Encontrada",
  IN_REVIEW: "Em análise",
  RESUME_READY: "Currículo preparado",
  AWAITING_REVIEW: "Aguardando revisão",
  APPLIED: "Candidatura realizada",
  INTERVIEW: "Entrevista",
  REJECTED: "Recusada",
  CLOSED: "Encerrada",
} as const;

export type ApplicationStatus = keyof typeof APPLICATION_STATUS;

// Candidaturas que já foram efetivamente enviadas
export const SUBMITTED_STATUSES: ApplicationStatus[] = ["APPLIED", "INTERVIEW", "REJECTED"];

// A partir de quantos % uma vaga conta como "compatível" no dashboard
export const COMPATIBLE_MIN_SCORE = 70;

export const WORK_MODES = ["Presencial", "Híbrido", "Remoto", "Tanto faz"] as const;

// Regras do upload de currículo
export const MAX_PDF_BYTES = 5 * 1024 * 1024; // 5 MB
