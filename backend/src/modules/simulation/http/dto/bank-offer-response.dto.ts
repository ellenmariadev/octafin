import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class BankOfferResponseDto {
  @ApiProperty({ example: "BANK_GOLD" })
  bankId: string;

  @ApiProperty({ enum: ["PENDING", "IN_PROGRESS", "APPROVED", "DENIED", "TIMEOUT", "ERROR"] })
  status: string;

  @ApiPropertyOptional({ example: 1500000 })
  approvedAmountCents: number | null;

  @ApiPropertyOptional({ example: 150000 })
  installmentCents: number | null;

  @ApiPropertyOptional({ example: 5400000 })
  totalCents: number | null;

  @ApiPropertyOptional({ example: 190 })
  monthlyRateBps: number | null;

  @ApiPropertyOptional({ example: "reprovado pelo banco" })
  reason: string | null;

  @ApiPropertyOptional({ example: 120 })
  latencyMs: number | null;

  @ApiProperty({ example: 1 })
  attempts: number;

  @ApiPropertyOptional({ example: null })
  errorCode: string | null;
}
