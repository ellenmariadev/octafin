export class TimeoutError extends Error {
  constructor(readonly timeoutMs: number) {
    super(`operação excedeu o tempo limite de ${timeoutMs}ms`);
    this.name = "TimeoutError";
  }
}

export class RetryExhaustedError extends Error {
  constructor(
    readonly attempts: number,
    readonly cause: unknown,
  ) {
    super(`todas as ${attempts} tentativas falharam`);
    this.name = "RetryExhaustedError";
  }
}

export interface RetryPolicy {
  maxAttempts: number;
  timeoutMs: number;
  baseDelayMs: number;
  backoffFactor: number;
}

export interface RetryOutcome<T> {
  value: T;
  attempts: number;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function withTimeout<T>(task: () => Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new TimeoutError(timeoutMs)), timeoutMs);
    task().then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

/**
 * Executa `task` com timeout por tentativa e retry com backoff exponencial.
 * Lança {@link RetryExhaustedError} quando todas as tentativas falham.
 */
export async function executeWithRetry<T>(
  task: () => Promise<T>,
  policy: RetryPolicy,
): Promise<RetryOutcome<T>> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= policy.maxAttempts; attempt++) {
    try {
      const value = await withTimeout(task, policy.timeoutMs);
      return { value, attempts: attempt };
    } catch (error) {
      lastError = error;
      if (attempt === policy.maxAttempts) {
        break;
      }
      const delay = policy.baseDelayMs * Math.pow(policy.backoffFactor, attempt - 1);
      await sleep(delay);
    }
  }

  throw new RetryExhaustedError(policy.maxAttempts, lastError);
}
