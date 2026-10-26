/** Remove qualquer caractere que não seja dígito. */
export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

/** Aplica a máscara `XXX.XXX.XXX-XX` progressivamente. */
export function maskCpf(value: string): string {
  return onlyDigits(value)
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

/** Aplica a máscara `XX.XXX.XXX/0001-XX` progressivamente. */
export function maskCnpj(value: string): string {
  return onlyDigits(value)
    .slice(0, 14)
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)$/, "$1-$2");
}

const CPF_LENGTH = 11;
const CPF_FACTOR = 10;

function isAllSameDigit(digits: string): boolean {
  return digits.split("").every((digit) => digit === digits[0]);
}

function computeCpfCheckDigit(base: string, factorStart: number): number {
  let sum = 0;
  for (const digit of base) {
    sum += Number(digit) * factorStart;
    factorStart -= 1;
  }
  const remainder = (sum * CPF_FACTOR) % 11;
  return remainder >= 10 ? 0 : remainder;
}

/** Valida a estrutura e os dígitos verificadores de um CPF. */
export function isValidCpf(value: string): boolean {
  const digits = onlyDigits(value);
  if (digits.length !== CPF_LENGTH || isAllSameDigit(digits)) {
    return false;
  }
  const firstDigit = computeCpfCheckDigit(digits.slice(0, 9), 10);
  const secondDigit = computeCpfCheckDigit(digits.slice(0, 10), 11);
  return firstDigit === Number(digits[9]) && secondDigit === Number(digits[10]);
}

const CNPJ_LENGTH = 14;
const CNPJ_FIRST_WEIGHTS = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
const CNPJ_SECOND_WEIGHTS = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

function computeCnpjCheckDigit(base: string, weights: readonly number[]): number {
  const sum = base
    .split("")
    .reduce((acc, digit, index) => acc + Number(digit) * weights[index], 0);
  const remainder = sum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
}

/** Valida a estrutura e os dígitos verificadores de um CNPJ. */
export function isValidCnpj(value: string): boolean {
  const digits = onlyDigits(value);
  if (digits.length !== CNPJ_LENGTH || isAllSameDigit(digits)) {
    return false;
  }
  const firstDigit = computeCnpjCheckDigit(digits.slice(0, 12), CNPJ_FIRST_WEIGHTS);
  const secondDigit = computeCnpjCheckDigit(digits.slice(0, 13), CNPJ_SECOND_WEIGHTS);
  return firstDigit === Number(digits[12]) && secondDigit === Number(digits[13]);
}

const MAX_AGE_YEARS = 120;
const BIRTH_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Valida uma data de nascimento plausível (`YYYY-MM-DD`). */
export function isValidBirthDate(value: string): boolean {
  const match = BIRTH_DATE_PATTERN.exec(value);
  if (!match) {
    return false;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  if (month < 1 || month > 12) {
    return false;
  }

  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return false;
  }

  const today = new Date();
  const todayUtc = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  const inputUtc = Date.UTC(year, month - 1, day);
  if (inputUtc >= todayUtc) {
    return false;
  }

  const oldestUtc = Date.UTC(today.getUTCFullYear() - MAX_AGE_YEARS, today.getUTCMonth(), today.getUTCDate());
  return inputUtc >= oldestUtc;
}
