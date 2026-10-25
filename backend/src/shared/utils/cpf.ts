const CPF_LENGTH = 11;
const CPF_FACTOR = 10;

/** Remove qualquer caractere que não seja dígito. */
export function normalizeCpf(value: string): string {
  return value.replace(/\D/g, "");
}

/** Aplica a máscara `XXX.XXX.XXX-XX` a um CPF numérico. */
export function maskCpf(value: string): string {
  const digits = normalizeCpf(value);
  if (digits.length !== CPF_LENGTH) {
    return value;
  }
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

/** Retorna o CPF mascarado no formato `XXX.***.***-XX`, usado para armazenamento. */
export function maskCpfForStorage(value: string): string {
  const digits = normalizeCpf(value);
  if (digits.length !== CPF_LENGTH) {
    return value;
  }
  return `${digits.slice(0, 3)}.***.***-${digits.slice(9)}`;
}

function isAllSameDigit(digits: string): boolean {
  return digits.split("").every((digit) => digit === digits[0]);
}

function computeCheckDigit(base: string, factorStart: number): number {
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
  const digits = normalizeCpf(value);
  if (digits.length !== CPF_LENGTH) {
    return false;
  }
  if (isAllSameDigit(digits)) {
    return false;
  }

  const firstDigit = computeCheckDigit(digits.slice(0, 9), 10);
  const secondDigit = computeCheckDigit(digits.slice(0, 10), 11);

  return firstDigit === Number(digits[9]) && secondDigit === Number(digits[10]);
}
