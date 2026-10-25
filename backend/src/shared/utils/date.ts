const BIRTH_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const MAX_AGE_YEARS = 120;
const BRAZIL_TIME_ZONE = "America/Sao_Paulo";

/** Formata um `Date` como `YYYY-MM-DD` no fuso do Brasil. */
function formatBrazilDate(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: BRAZIL_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/** Valida se a string é uma data de nascimento plausível (`YYYY-MM-DD`). */
export function isValidBirthDate(value: unknown): boolean {
  if (typeof value !== "string") {
    return false;
  }
  const match = BIRTH_DATE_PATTERN.exec(value);
  if (!match) {
    return false;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  if (month < 1 || month > 12) {
    return false;
  }

  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return false;
  }

  const today = formatBrazilDate(new Date());
  if (value >= today) {
    return false;
  }

  const oldestYear = String(Number(today.slice(0, 4)) - MAX_AGE_YEARS).padStart(4, "0");
  const oldest = `${oldestYear}${today.slice(4)}`;
  if (value < oldest) {
    return false;
  }

  return true;
}

/** Formata uma data (string `YYYY-MM-DD` ou `Date`) como `DD/MM/YYYY`. */
export function formatDateBR(value: string | Date): string {
  if (typeof value === "string") {
    const [year, month, day] = value.split("-");
    return `${day}/${month}/${year}`;
  }
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: BRAZIL_TIME_ZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(value);
}
