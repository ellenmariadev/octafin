import * as yup from "yup";
import { isValidBirthDate, isValidCnpj, isValidCpf } from "@/lib/validation";

export const MIN_REQUESTED_AMOUNT = 100;
export const MAX_REQUESTED_AMOUNT = 100_000;
export const MIN_SALARY = 100;
export const MAX_SALARY = 1_000_000;
export const MIN_INSTALLMENTS = 12;
export const MAX_INSTALLMENTS = 96;

export const simulationSchema = yup.object({
  name: yup.string().trim().max(120, "máximo de 120 caracteres").optional(),
  email: yup
    .string()
    .trim()
    .email("informe um e-mail válido")
    .max(254, "máximo de 254 caracteres")
    .optional(),
  cpf: yup
    .string()
    .required("CPF é obrigatório")
    .test("cpf-valido", "CPF inválido", (value) => isValidCpf(value ?? "")),
  monthlySalary: yup
    .number()
    .typeError("informe um salário válido")
    .required("salário mensal é obrigatório")
    .min(MIN_SALARY, `salário mínimo de R$ ${MIN_SALARY}`)
    .max(MAX_SALARY, `salário máximo de R$ ${MAX_SALARY.toLocaleString("pt-BR")}`),
  employerCnpj: yup
    .string()
    .required("CNPJ é obrigatório")
    .test("cnpj-valido", "CNPJ inválido", (value) => isValidCnpj(value ?? "")),
  birthDate: yup
    .string()
    .required("data de nascimento é obrigatória")
    .test("birthdate-valida", "data de nascimento inválida", (value) =>
      isValidBirthDate(value ?? ""),
    ),
  requestedAmount: yup
    .number()
    .typeError("informe um valor válido")
    .required("valor solicitado é obrigatório")
    .min(MIN_REQUESTED_AMOUNT, `valor mínimo de R$ ${MIN_REQUESTED_AMOUNT}`)
    .max(
      MAX_REQUESTED_AMOUNT,
      `valor máximo de R$ ${MAX_REQUESTED_AMOUNT.toLocaleString("pt-BR")}`,
    ),
  installments: yup
    .number()
    .typeError("informe um prazo válido")
    .required("prazo é obrigatório")
    .integer("prazo deve ser um número inteiro")
    .min(MIN_INSTALLMENTS, `mínimo de ${MIN_INSTALLMENTS} parcelas`)
    .max(MAX_INSTALLMENTS, `máximo de ${MAX_INSTALLMENTS} parcelas`),
  consent: yup
    .boolean()
    .oneOf([true], "é necessário consentir com o processamento")
    .required(),
  idempotencyKey: yup.string().trim().max(128, "máximo de 128 caracteres").optional(),
});

export type SimulationFormValues = yup.InferType<typeof simulationSchema>;
