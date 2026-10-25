import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  Equals,
  IsEmail,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Max,
  MaxLength,
  Min,
} from "class-validator";
import { IsValidCnpj } from "@/shared/decorators/cnpj.decorator";
import { IsValidCpf } from "@/shared/decorators/cpf.decorator";
import { IsValidBirthDate } from "@/shared/decorators/date.decorator";
import {
  MAX_INSTALLMENTS,
  MAX_REQUESTED_AMOUNT_CENTS,
  MAX_SALARY_CENTS,
  MIN_INSTALLMENTS,
  MIN_REQUESTED_AMOUNT_CENTS,
  MIN_SALARY_CENTS,
  fromCents,
} from "@/shared/utils/money";

const MIN_REQUESTED_AMOUNT_REAIS = fromCents(MIN_REQUESTED_AMOUNT_CENTS);
const MAX_REQUESTED_AMOUNT_REAIS = fromCents(MAX_REQUESTED_AMOUNT_CENTS);
const MIN_SALARY_REAIS = fromCents(MIN_SALARY_CENTS);
const MAX_SALARY_REAIS = fromCents(MAX_SALARY_CENTS);

export class CreateSimulationDto {
  @ApiPropertyOptional({ description: "Nome do cliente (não persistido).", maxLength: 120 })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @ApiPropertyOptional({ description: "E-mail do cliente (não persistido).", maxLength: 254 })
  @IsOptional()
  @IsEmail()
  @MaxLength(254)
  email?: string;

  @ApiProperty({ description: "CPF do cliente (apenas dígitos ou com máscara)." })
  @IsString()
  @Length(11, 14)
  @IsValidCpf()
  cpf: string;

  @ApiProperty({ description: "Salário mensal em reais." })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(MIN_SALARY_REAIS)
  @Max(MAX_SALARY_REAIS)
  monthlySalary: number;

  @ApiProperty({ description: "CNPJ do empregador." })
  @IsString()
  @Length(14, 18)
  @IsValidCnpj()
  employerCnpj: string;

  @ApiProperty({ description: "Data de nascimento no formato DD-MM-YYYY." })
  @IsString()
  @IsValidBirthDate()
  birthDate: string;

  @ApiProperty({ description: "Valor solicitado em reais." })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(MIN_REQUESTED_AMOUNT_REAIS)
  @Max(MAX_REQUESTED_AMOUNT_REAIS)
  requestedAmount: number;

  @ApiProperty({
    description: "Quantidade de parcelas.",
    minimum: MIN_INSTALLMENTS,
    maximum: MAX_INSTALLMENTS,
  })
  @IsInt()
  @Min(MIN_INSTALLMENTS)
  @Max(MAX_INSTALLMENTS)
  installments: number;

  @ApiProperty({ description: "Consentimento obrigatório do cliente." })
  @Equals(true, { message: "consentimento é obrigatório" })
  consent: boolean;

  @ApiPropertyOptional({ description: "Chave de idempotência opcional.", maxLength: 128 })
  @IsOptional()
  @IsString()
  @MaxLength(128)
  idempotencyKey?: string;
}
