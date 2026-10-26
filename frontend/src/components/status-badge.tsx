import { Badge } from "@/components/ui/badge";
import type { BankOfferStatus, SimulationStatus } from "@/lib/types";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline" | "ghost" | "link";

interface StatusConfig {
  label: string;
  variant?: BadgeVariant;
  className?: string;
}

const OFFER_STATUS_CONFIG: Record<BankOfferStatus, StatusConfig> = {
  PENDING: { label: "Pendente", variant: "outline" },
  IN_PROGRESS: { label: "Processando", variant: "secondary" },
  APPROVED: {
    label: "Aprovado",
    className: "border-transparent bg-emerald-600 text-white",
  },
  DENIED: { label: "Reprovado", variant: "destructive" },
  TIMEOUT: { label: "Tempo esgotado", variant: "outline" },
  ERROR: { label: "Erro", variant: "destructive" },
};

const SIMULATION_STATUS_CONFIG: Record<SimulationStatus, StatusConfig> = {
  QUEUED: { label: "Na fila", variant: "secondary" },
  PROCESSING: { label: "Processando", variant: "secondary" },
  COMPLETED: {
    label: "Concluída",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  PARTIAL: { label: "Parcial", className: "border-amber-200 bg-amber-50 text-amber-700" },
  FAILED: { label: "Falhou", variant: "destructive" },
};

export function OfferStatusBadge({ status }: { status: BankOfferStatus }) {
  const config = OFFER_STATUS_CONFIG[status];
  return (
    <Badge variant={config.variant ?? "default"} className={config.className}>
      {config.label}
    </Badge>
  );
}

export function SimulationStatusBadge({ status }: { status: SimulationStatus }) {
  const config = SIMULATION_STATUS_CONFIG[status];
  return (
    <Badge variant={config.variant ?? "default"} className={config.className}>
      {config.label}
    </Badge>
  );
}
