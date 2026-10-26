import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { BankOfferResponseDto } from "./bank-offer-response.dto";

export class SimulationResponseDto {
  @ApiProperty({ example: "9a2c..." })
  id: string;

  @ApiProperty({ enum: ["QUEUED", "PROCESSING", "COMPLETED", "PARTIAL", "FAILED"] })
  status: string;

  @ApiPropertyOptional({ example: "req-123" })
  idempotencyKey: string | null;

  @ApiProperty({ example: "123.***.***-09" })
  cpfMasked: string;

  @ApiProperty({ example: 1000000 })
  requestedAmountCents: number;

  @ApiProperty({ example: 24 })
  installments: number;

  @ApiProperty()
  deadlineAt: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiPropertyOptional()
  completedAt: Date | null;

  @ApiPropertyOptional({ enum: ["WORKER", "DEADLINE"] })
  closeReason: string | null;

  @ApiProperty({ type: [BankOfferResponseDto] })
  offers: BankOfferResponseDto[];
}
