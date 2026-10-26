/** Formata um valor em centavos como moeda brasileira. */
export function formatBRL(cents: number | null): string {
  if (cents == null) {
    return "—";
  }
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

/** Formata uma taxa mensal em pontos-base como percentual (`189` -> `1,89% a.m.`). */
export function formatMonthlyRate(bps: number | null): string {
  if (bps == null) {
    return "—";
  }
  return `${(bps / 100).toFixed(2).replace(".", ",")}% a.m.`;
}

/** Formata uma taxa em pontos-base como percentual sem sufixo (`189` -> `1,89%`). */
export function formatPercent(bps: number | null): string {
  if (bps == null) {
    return "—";
  }
  return `${(bps / 100).toFixed(2).replace(".", ",")}%`;
}

/** Formata uma data/hora ISO como `dd/mm/aaaa hh:mm:ss`. */
export function formatDateTime(value: string | Date | null): string {
  if (!value) {
    return "—";
  }
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "medium",
  });
}

/** Formata latência em milissegundos. */
export function formatLatency(ms: number | null): string {
  if (ms == null) {
    return "—";
  }
  return `${ms} ms`;
}
