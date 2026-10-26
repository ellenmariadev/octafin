import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post } from "@nestjs/common";
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { SimulationService } from "../application/simulation.service";
import type { SimulationWithOffers } from "../infra/prisma/simulation.repository";
import { CreateSimulationDto } from "./dto/create-simulation.dto";
import { SimulationResponseDto } from "./dto/simulation-response.dto";
import { BankOfferResponseDto } from "./dto/bank-offer-response.dto";

@ApiTags("simulations")
@Controller("simulations")
export class SimulationController {
  constructor(private readonly service: SimulationService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Cria uma simulação e dispara o processamento assíncrono" })
  @ApiCreatedResponse({ type: SimulationResponseDto })
  async create(@Body() dto: CreateSimulationDto): Promise<SimulationResponseDto> {
    const simulation = await this.service.create(dto);
    return toResponseDto(simulation);
  }

  @Get(":id")
  @ApiOperation({ summary: "Consulta o estado de uma simulação e das suas ofertas" })
  @ApiOkResponse({ type: SimulationResponseDto })
  async get(@Param("id") id: string): Promise<SimulationResponseDto> {
    const simulation = await this.service.get(id);
    return toResponseDto(simulation);
  }
}

function toResponseDto(simulation: SimulationWithOffers): SimulationResponseDto {
  return {
    id: simulation.id,
    status: simulation.status,
    idempotencyKey: simulation.idempotencyKey,
    cpfMasked: simulation.cpfMasked,
    requestedAmountCents: simulation.requestedAmountCents,
    installments: simulation.installments,
    deadlineAt: simulation.deadlineAt,
    createdAt: simulation.createdAt,
    completedAt: simulation.completedAt,
    closeReason: simulation.closeReason,
    offers: simulation.offers.map(
      (offer): BankOfferResponseDto => ({
        bankId: offer.bankId,
        status: offer.status,
        approvedAmountCents: offer.approvedAmountCents,
        installmentCents: offer.installmentCents,
        totalCents: offer.totalCents,
        monthlyRateBps: offer.monthlyRateBps,
        reason: offer.reason,
        latencyMs: offer.latencyMs,
        attempts: offer.attempts,
        errorCode: offer.errorCode,
      }),
    ),
  };
}
