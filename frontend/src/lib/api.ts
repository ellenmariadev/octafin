import axios, { AxiosError, type AxiosRequestConfig } from "axios";
import type { Simulation } from "./types";

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000").replace(
  /\/+$/,
  "",
);

const http = axios.create({
  baseURL: `${API_URL}/api/v1`,
  timeout: 10_000,
});

export interface CreateSimulationInput {
  name?: string;
  email?: string;
  cpf: string;
  monthlySalary: number;
  employerCnpj: string;
  birthDate: string;
  requestedAmount: number;
  installments: number;
  consent: boolean;
  idempotencyKey?: string;
}

export async function createSimulation(
  input: CreateSimulationInput,
  config?: AxiosRequestConfig,
): Promise<Simulation> {
  const { data } = await http.post<Simulation>("/simulations", input, config);
  return data;
}

export async function getSimulation(
  id: string,
  config?: AxiosRequestConfig,
): Promise<Simulation> {
  const { data } = await http.get<Simulation>(`/simulations/${id}`, config);
  return data;
}

/** Extrai uma mensagem legível de qualquer erro de integração. */
export function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const message = (error.response?.data as { message?: string } | undefined)?.message;
    if (message) {
      return message;
    }
    if (error.code === "ECONNABORTED") {
      return "a requisição excedeu o tempo limite";
    }
    return "não foi possível se comunicar com o servidor";
  }
  return "ocorreu um erro inesperado";
}
