import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Prisma } from "@/generated/prisma/client";
import { SimulationRepository, type SimulationWithOffers } from "../infra/prisma/simulation.repository";
import { SimulationProducerService } from "./queue/simulation-producer.service";
import { SimulationDeadlineService } from "./queue/simulation-deadline.service";
import type { BankEvaluationRequest } from "@/modules/banks/contracts/bank-adapter";
import type { CreateSimulationDto } from "../http/dto/create-simulation.dto";
import { normalizeCpf, maskCpfForStorage } from "@/shared/utils/cpf";
import { toCents } from "@/shared/utils/money";
import { NotFoundError, ServiceUnavailableError } from "@/shared/errors/app-error";

@Injectable()
export class SimulationService {
  constructor(
    private readonly repository: SimulationRepository,
    private readonly producer: SimulationProducerService,
    private readonly deadline: SimulationDeadlineService,
    private readonly config: ConfigService,
  ) {}

  async create(dto: CreateSimulationDto): Promise<SimulationWithOffers> {
    const cpf = normalizeCpf(dto.cpf);
    const cpfMasked = maskCpfForStorage(dto.cpf);
    const requestedAmountCents = toCents(dto.requestedAmount);
    const monthlySalaryCents = toCents(dto.monthlySalary);
    const deadlineAt = this.deadlineAt();

    if (dto.idempotencyKey) {
      const existing = await this.repository.findByIdempotencyKey(dto.idempotencyKey);
      if (existing) {
        return existing;
      }
    }

    const simulation = await this.createSimulation(
      dto,
      cpfMasked,
      requestedAmountCents,
      deadlineAt,
    );

    try {
      const request: BankEvaluationRequest = {
        simulationId: simulation.id,
        cpf,
        requestedAmountCents,
        installments: dto.installments,
        monthlySalaryCents,
        employerCnpj: dto.employerCnpj,
        birthDate: dto.birthDate,
      };

      await this.producer.enqueue(request);
      await this.deadline.schedule(simulation.id, deadlineAt);
    } catch {
      await this.repository.closeSimulation(simulation.id, "FAILED", "WORKER");
      throw new ServiceUnavailableError("não foi possível enfileirar a simulação");
    }

    return simulation;
  }

  async get(id: string): Promise<SimulationWithOffers> {
    const simulation = await this.repository.findById(id);
    if (!simulation) {
      throw new NotFoundError(`simulação ${id} não encontrada`);
    }
    return simulation;
  }

  private async createSimulation(
    dto: CreateSimulationDto,
    cpfMasked: string,
    requestedAmountCents: number,
    deadlineAt: Date,
  ): Promise<SimulationWithOffers> {
    try {
      return await this.repository.create({
        idempotencyKey: dto.idempotencyKey ?? null,
        cpfMasked,
        requestedAmountCents,
        installments: dto.installments,
        deadlineAt,
      });
    } catch (error) {
      if (dto.idempotencyKey && isUniqueViolation(error)) {
        const existing = await this.repository.findByIdempotencyKey(dto.idempotencyKey);
        if (existing) {
          return existing;
        }
      }
      throw error;
    }
  }

  private deadlineAt(): Date {
    const seconds = Number(this.config.get<number>("SIMULATION_DEADLINE_SECONDS") ?? 60);
    return new Date(Date.now() + seconds * 1000);
  }
}

function isUniqueViolation(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}
