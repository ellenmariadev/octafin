"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  createSimulation,
  getErrorMessage,
  getSimulation,
  type CreateSimulationInput,
} from "@/lib/api";
import { isSimulationOpen, type Simulation } from "@/lib/types";
import { ResultsPanel } from "./results-panel";
import { SimulationForm } from "./simulation-form";

const DEMO_SIMULATION: Simulation = {
  id: "demo-simulacao",
  status: "COMPLETED",
  idempotencyKey: null,
  cpfMasked: "***.000.000-00",
  requestedAmountCents: 1_000_000,
  installments: 24,
  deadlineAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  completedAt: new Date().toISOString(),
  closeReason: "WORKER",
  offers: [
    {
      bankId: "BANK_GOLD",
      status: "APPROVED",
      approvedAmountCents: 1_000_000,
      installmentCents: 52_000,
      totalCents: 1_248_000,
      monthlyRateBps: 180,
      reason: null,
      latencyMs: 120,
      attempts: 1,
      errorCode: null,
    },
    {
      bankId: "BANK_SILVER",
      status: "APPROVED",
      approvedAmountCents: 1_000_000,
      installmentCents: 54_500,
      totalCents: 1_308_000,
      monthlyRateBps: 195,
      reason: null,
      latencyMs: 340,
      attempts: 1,
      errorCode: null,
    },
  ],
};

export function SimulationHome() {
  const [simulation, setSimulation] = useState<Simulation | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = useCallback(async (input: CreateSimulationInput) => {
    setSubmitting(true);
    setErrorMessage(null);
    try {
      const created = await createSimulation(input);
      setSimulation(created);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }, []);

  const simulationId = simulation?.id;

  useEffect(() => {
    if (!simulationId) {
      return;
    }

    const controller = new AbortController();
    let timer: ReturnType<typeof setInterval> | null = null;
    let stopped = false;

    const poll = async () => {
      try {
        const latest = await getSimulation(simulationId, { signal: controller.signal });
        if (stopped) {
          return;
        }
        setSimulation(latest);
        if (!isSimulationOpen(latest.status) && timer) {
          clearInterval(timer);
          timer = null;
        }
      } catch (error) {
        if (stopped || controller.signal.aborted) {
          return;
        }
        setErrorMessage(getErrorMessage(error));
      }
    };

    void poll();
    timer = setInterval(poll, 1_000);

    return () => {
      stopped = true;
      controller.abort();
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [simulationId]);

  const handleReset = () => {
    setSimulation(null);
    setErrorMessage(null);
  };

  const displaySimulation = simulation ?? DEMO_SIMULATION;
  const isDemo = simulation === null;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-primary px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative h-9 w-[120px]">
              <Image
                src="/logo.png"
                alt="Octafin"
                fill
                className="object-contain object-left"
                priority
              />
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Encontre a melhor opção para você.
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
              Compare ofertas de crédito em um só lugar, de forma simples e transparente.
            </p>
          </div>

          {errorMessage ? (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          ) : null}

          <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
            <SimulationForm
              submitting={submitting}
              errorMessage={null}
              onSubmit={handleSubmit}
              onReset={handleReset}
              showReset={!!simulation}
            />
            <ResultsPanel
              simulation={displaySimulation}
              isDemo={isDemo}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
