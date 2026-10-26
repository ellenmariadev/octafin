import { Check, Clock, Landmark, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatBRL } from "@/lib/format";
import { BANK_LABELS } from "@/lib/simulation";
import type { BankOffer, BankOfferStatus } from "@/lib/types";

interface OfferCardProps {
  offer: BankOffer;
  installments: number;
}

const STATUS_ICON: Record<BankOfferStatus, React.ElementType> = {
  PENDING: Clock,
  IN_PROGRESS: Clock,
  APPROVED: Check,
  DENIED: X,
  TIMEOUT: Clock,
  ERROR: X,
};

const STATUS_LABEL: Record<BankOfferStatus, string> = {
  PENDING: "Aguardando",
  IN_PROGRESS: "Processando",
  APPROVED: "Oferta aprovada",
  DENIED: "Oferta recusada",
  TIMEOUT: "Tempo esgotado",
  ERROR: "Erro na consulta",
};

export function OfferCard({ offer, installments }: OfferCardProps) {
  const isApproved = offer.status === "APPROVED";
  const isPending = offer.status === "PENDING" || offer.status === "IN_PROGRESS";
  const StatusIcon = STATUS_ICON[offer.status];

  return (
    <Card className="border border-border shadow-sm">
      <CardContent className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-muted text-foreground">
              <Landmark className="size-4" />
            </span>
            <div>
              <p className="font-medium text-foreground">{BANK_LABELS[offer.bankId]}</p>
              <p className="text-xs text-muted-foreground">{STATUS_LABEL[offer.status]}</p>
            </div>
          </div>
          {!isApproved ? (
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                isPending
                  ? "bg-amber-100 text-amber-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              <StatusIcon className="size-3" />
              {isPending ? "Processando" : "Recusado"}
            </span>
          ) : null}
        </div>

        {isApproved && offer.installmentCents != null ? (
          <div className="rounded-lg border bg-card p-3">
            <p className="text-xs text-muted-foreground">Parcela mensal</p>
            <p className="text-lg font-semibold text-foreground">
              {formatBRL(offer.installmentCents)}
            </p>
            {offer.totalCents != null ? (
              <p className="mt-1 text-xs text-muted-foreground">
                Total a pagar: {formatBRL(offer.totalCents)} · {installments} parcelas
              </p>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            {offer.reason || "Aguardando resposta da instituição financeira."}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
