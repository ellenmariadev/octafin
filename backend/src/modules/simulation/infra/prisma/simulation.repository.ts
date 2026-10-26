import { Injectable } from "@nestjs/common";
import { Prisma, type Simulation } from "@/generated/prisma/client";
import { PrismaService } from "@/infra/database/prisma.service";
import { BANK_IDS, type BankId } from "@type/bank-id";
import type { BankOfferStatus } from "@type/bank-offer-status";
import type { SimulationStatus } from "@type/simulation-status";
import type { CloseReason } from "@type/close-reason";
import { isSimulationTerminal } from "@type/simulation-status";
import type { BankEvaluationResult } from "@/modules/banks/contracts/bank-adapter";

export type SimulationWithOffers = Prisma.SimulationGetPayload<{ include: { offers: true } }>;

export interface CreateSimulationData {
  idempotencyKey: string | null;
  cpfMasked: string;
  requestedAmountCents: number;
  installments: number;
  deadlineAt: Date;
}

const ACTIVE_OFFER_STATUSES: BankOfferStatus[] = ["PENDING", "IN_PROGRESS"];
const OPEN_SIMULATION_STATUSES: SimulationStatus[] = ["QUEUED", "PROCESSING"];

/**
 * Persistência da simulação e das ofertas bancárias, com bloqueio de linha e
 * transações para garantir consistência sob concorrência.
 */
@Injectable()
export class SimulationRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** Cria a simulação e as ofertas pendentes de todos os bancos (transacional). */
  async create(data: CreateSimulationData): Promise<SimulationWithOffers> {
    return this.prisma.simulation.create({
      data: {
        idempotencyKey: data.idempotencyKey,
        cpfMasked: data.cpfMasked,
        requestedAmountCents: data.requestedAmountCents,
        installments: data.installments,
        deadlineAt: data.deadlineAt,
        offers: {
          create: BANK_IDS.map((bankId) => ({ bankId })),
        },
      },
      include: { offers: true },
    });
  }

  async findById(id: string): Promise<SimulationWithOffers | null> {
    return this.prisma.simulation.findUnique({
      where: { id },
      include: { offers: true },
    });
  }

  async findByIdempotencyKey(key: string): Promise<SimulationWithOffers | null> {
    return this.prisma.simulation.findUnique({
      where: { idempotencyKey: key },
      include: { offers: true },
    });
  }

  /**
   * Transiciona a simulação de `QUEUED` para `PROCESSING`.
   *
   * Usa `SELECT ... FOR UPDATE` para travar a linha e evitar que dois workers
   * processem a mesma simulação ao mesmo tempo. Retorna `null` se a simulação
   * não existir ou já estiver em um estado não processável.
   */
  async markProcessing(id: string): Promise<Simulation | null> {
    return this.prisma.$transaction(async (tx) => {
      const rows = await tx.$queryRaw<Array<{ id: string; status: string }>>(
        Prisma.sql`SELECT "id", "status" FROM "Simulation" WHERE "id" = ${id} FOR UPDATE`,
      );

      if (rows.length === 0) {
        return null;
      }
      if (rows[0].status !== "QUEUED") {
        return tx.simulation.findUnique({ where: { id } });
      }

      return tx.simulation.update({
        where: { id },
        data: { status: "PROCESSING" },
      });
    });
  }

  /**
   * Marca uma oferta como `IN_PROGRESS` se ela estiver processável (`PENDING`,
   * ou já `IN_PROGRESS` em uma retentativa). Retorna `false` se a oferta não
   * existir ou já estiver em estado terminal (resposta tardia deve ser ignorada).
   */
  async markOfferInProgress(simulationId: string, bankId: BankId): Promise<boolean> {
    const offer = await this.prisma.bankOffer.findUnique({
      where: { simulationId_bankId: { simulationId, bankId } },
    });

    if (!offer || (offer.status !== "PENDING" && offer.status !== "IN_PROGRESS")) {
      return false;
    }

    if (offer.status === "PENDING") {
      await this.prisma.bankOffer.update({
        where: { id: offer.id },
        data: { status: "IN_PROGRESS" },
      });
    }

    return true;
  }

  /**
   * Persiste o resultado final de uma oferta. Só atualiza ofertas em
   * `IN_PROGRESS`, garantindo que uma resposta tardia não sobrescreva um estado
   * terminal (ex.: `TIMEOUT` aplicado pelo deadline).
   */
  async saveOffer(
    simulationId: string,
    bankId: BankId,
    result: BankEvaluationResult,
  ): Promise<boolean> {
    const { count } = await this.prisma.bankOffer.updateMany({
      where: { simulationId, bankId, status: "IN_PROGRESS" },
      data: {
        status: result.status,
        approvedAmountCents: result.approvedAmountCents,
        installmentCents: result.installmentCents,
        totalCents: result.totalCents,
        monthlyRateBps: result.monthlyRateBps,
        reason: result.reason,
        errorCode: result.errorCode,
        attempts: result.attempts,
        latencyMs: result.latencyMs,
      },
    });
    return count === 1;
  }

  /**
   * Finaliza a simulação. Fecha ofertas ainda ativas como `TIMEOUT` e marca o
   * status terminal de forma atômica. Retorna o estado atual se já terminal.
   */
  async closeSimulation(
    id: string,
    status: SimulationStatus,
    closeReason?: CloseReason,
  ): Promise<Simulation | null> {
    return this.prisma.$transaction(async (tx) => {
      const simulation = await tx.simulation.findUnique({ where: { id } });
      if (!simulation || isSimulationTerminal(simulation.status)) {
        return simulation;
      }

      await tx.bankOffer.updateMany({
        where: { simulationId: id, status: { in: ACTIVE_OFFER_STATUSES } },
        data: { status: "TIMEOUT", errorCode: "SIMULATION_CLOSED" },
      });

      return tx.simulation.update({
        where: { id },
        data: {
          status,
          completedAt: new Date(),
          closeReason: closeReason ?? null,
        },
      });
    });
  }

  /** Lista simulações abertas cujo prazo já expirou (para o reaper). */
  async findOverdue(now: Date): Promise<Array<{ id: string; deadlineAt: Date }>> {
    return this.prisma.simulation.findMany({
      where: { status: { in: OPEN_SIMULATION_STATUSES }, deadlineAt: { lt: now } },
      select: { id: true, deadlineAt: true },
    });
  }
}
