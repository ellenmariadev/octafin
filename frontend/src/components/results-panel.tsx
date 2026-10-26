import { Check, Clock, Landmark } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatBRL, formatPercent } from "@/lib/format";
import { BANK_LABELS, getBestOffer } from "@/lib/simulation";
import type { Simulation } from "@/lib/types";
import { OfferCard } from "./offer-card";
import { SimulationStatusBadge } from "./status-badge";

interface ResultsPanelProps {
  simulation: Simulation;
  isDemo?: boolean;
}

export function ResultsPanel({ simulation, isDemo = false }: ResultsPanelProps) {
  const bestOffer = getBestOffer(simulation.offers);

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Clock className="size-4" />
              </span>
              Resultado da simulação
            </CardTitle>
            {isDemo && (
              <p className="mt-1 text-sm text-muted-foreground">
                Simulação ilustrativa
              </p>
            )}
          </div>
          <SimulationStatusBadge status={simulation.status} />
        </div>
      </CardHeader>
      <CardContent className="grid gap-4">
        {bestOffer ? (
          <div className="rounded-xl border-2 border-primary bg-primary/5 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Landmark className="size-4" />
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    {BANK_LABELS[bestOffer.bankId]}
                  </p>
                  <p className="text-xs text-muted-foreground">Oferta aprovada</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground">
                <Check className="size-3" />
                Melhor opção
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-card p-3">
                <p className="text-xs text-muted-foreground">Valor solicitado</p>
                <p className="text-lg font-semibold text-foreground">
                  {formatBRL(simulation.requestedAmountCents)}
                </p>
              </div>
              <div className="rounded-lg bg-card p-3">
                <p className="text-xs text-muted-foreground">Parcela mensal</p>
                <p className="text-lg font-semibold text-foreground">
                  {formatBRL(bestOffer.installmentCents)}
                </p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-xs text-muted-foreground">Total a pagar</p>
                <p className="text-sm font-medium text-foreground">
                  {formatBRL(bestOffer.totalCents)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Taxa mensal</p>
                <p className="text-sm font-medium text-foreground">
                  {formatPercent(bestOffer.monthlyRateBps)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Prazo</p>
                <p className="text-sm font-medium text-foreground">
                  {simulation.installments} parcelas
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {simulation.offers
          .filter((offer) => offer.bankId !== bestOffer?.bankId)
          .map((offer) => (
            <OfferCard
              key={offer.bankId}
              offer={offer}
              installments={simulation.installments}
            />
          ))}

        <p className="text-xs text-muted-foreground">
          Valores e condições podem variar conforme o perfil, análise e regras de
          cada instituição.
        </p>
      </CardContent>
    </Card>
  );
}
