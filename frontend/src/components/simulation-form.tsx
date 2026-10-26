"use client";

import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  ArrowRight,
  Building2,
  Calendar,
  CreditCard,
  FileText,
  LoaderCircle,
  Lock,
  Mail,
  User,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CreateSimulationInput } from "@/lib/api";
import { maskCnpj, maskCpf, onlyDigits } from "@/lib/validation";
import {
  MAX_REQUESTED_AMOUNT,
  MAX_SALARY,
  MIN_REQUESTED_AMOUNT,
  MIN_SALARY,
  simulationSchema,
  type SimulationFormValues,
} from "@/schemas/simulation.schema";

const INSTALLMENT_OPTIONS = [12, 18, 24, 36, 48, 60, 72, 84, 96];

interface SimulationFormProps {
  submitting: boolean;
  errorMessage: string | null;
  onSubmit: (input: CreateSimulationInput) => void;
  onReset: () => void;
  showReset: boolean;
}

function FieldError({ message }: { message?: string }) {
  return (
    <p className="min-h-[1.25rem] text-xs text-destructive">
      {message ?? "\u00A0"}
    </p>
  );
}

function InputIcon({
  icon: Icon,
  children,
  error,
}: {
  icon: React.ElementType;
  children: React.ReactNode;
  error?: boolean;
}) {
  return (
    <div className="relative">
      <Icon
        className={`pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 ${
          error ? "text-destructive" : "text-muted-foreground"
        }`}
      />
      {children}
    </div>
  );
}

function InputPrefix({
  prefix,
  children,
  error,
}: {
  prefix: string;
  children: React.ReactNode;
  error?: boolean;
}) {
  return (
    <div className="relative">
      <span
        className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm ${
          error ? "text-destructive" : "text-muted-foreground"
        }`}
      >
        {prefix}
      </span>
      {children}
    </div>
  );
}

export function SimulationForm({
  submitting,
  errorMessage,
  onSubmit,
  onReset,
  showReset,
}: SimulationFormProps) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SimulationFormValues>({
    resolver: yupResolver(simulationSchema),
    defaultValues: {
      name: "",
      email: "",
      cpf: "",
      monthlySalary: undefined,
      employerCnpj: "",
      birthDate: "",
      requestedAmount: undefined,
      installments: undefined,
      consent: false,
    },
  });

  const handleFormSubmit = (values: SimulationFormValues) => {
    onSubmit({
      name: values.name || undefined,
      email: values.email || undefined,
      cpf: onlyDigits(values.cpf ?? ""),
      monthlySalary: values.monthlySalary as number,
      employerCnpj: onlyDigits(values.employerCnpj ?? ""),
      birthDate: values.birthDate as string,
      requestedAmount: values.requestedAmount as number,
      installments: values.installments as number,
      consent: true,
    });
  };

  const handleReset = () => {
    reset();
    onReset();
  };

  return (
    <div className="flex flex-col gap-4">
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileText className="size-4" />
            </span>
            Dados da simulação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit(handleFormSubmit)}
            className="grid gap-5"
            noValidate
          >
            {errorMessage ? (
              <Alert variant="destructive">
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label htmlFor="name">Nome completo</Label>
                <InputIcon icon={User} error={!!errors.name}>
                  <Input
                    id="name"
                    placeholder="Seu nome completo"
                    autoComplete="name"
                    className="pl-9"
                    {...register("name")}
                  />
                </InputIcon>
                <FieldError message={errors.name?.message} />
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="email">E-mail</Label>
                <InputIcon icon={Mail} error={!!errors.email}>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@contato.com"
                    autoComplete="email"
                    className="pl-9"
                    {...register("email")}
                  />
                </InputIcon>
                <FieldError message={errors.email?.message} />
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="cpf">CPF</Label>
                <Controller
                  name="cpf"
                  control={control}
                  render={({ field }) => (
                    <InputIcon icon={CreditCard} error={!!errors.cpf}>
                      <Input
                        id="cpf"
                        inputMode="numeric"
                        placeholder="000.000.000-00"
                        autoComplete="off"
                        className="pl-9"
                        value={field.value ?? ""}
                        onChange={(event) => field.onChange(maskCpf(event.target.value))}
                        aria-invalid={!!errors.cpf}
                      />
                    </InputIcon>
                  )}
                />
                <FieldError message={errors.cpf?.message} />
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="birthDate">Data de nascimento</Label>
                <InputIcon icon={Calendar} error={!!errors.birthDate}>
                  <Input
                    id="birthDate"
                    type="date"
                    className="pl-9"
                    {...register("birthDate")}
                  />
                </InputIcon>
                <FieldError message={errors.birthDate?.message} />
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="monthlySalary">Renda mensal</Label>
                <InputPrefix prefix="R$" error={!!errors.monthlySalary}>
                  <Input
                    id="monthlySalary"
                    type="number"
                    min={MIN_SALARY}
                    max={MAX_SALARY}
                    step="0.01"
                    placeholder="4.500,00"
                    className="pl-12"
                    {...register("monthlySalary", { valueAsNumber: true })}
                  />
                </InputPrefix>
                <FieldError message={errors.monthlySalary?.message} />
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="employerCnpj">CNPJ do empregador</Label>
                <Controller
                  name="employerCnpj"
                  control={control}
                  render={({ field }) => (
                    <InputIcon icon={Building2} error={!!errors.employerCnpj}>
                      <Input
                        id="employerCnpj"
                        inputMode="numeric"
                        placeholder="00.000.000/0000-00"
                        autoComplete="off"
                        className="pl-9"
                        value={field.value ?? ""}
                        onChange={(event) => field.onChange(maskCnpj(event.target.value))}
                        aria-invalid={!!errors.employerCnpj}
                      />
                    </InputIcon>
                  )}
                />
                <FieldError message={errors.employerCnpj?.message} />
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="requestedAmount">Valor desejado</Label>
                <InputPrefix prefix="R$" error={!!errors.requestedAmount}>
                  <Input
                    id="requestedAmount"
                    type="number"
                    min={MIN_REQUESTED_AMOUNT}
                    max={MAX_REQUESTED_AMOUNT}
                    step="0.01"
                    placeholder="10.000,00"
                    className="pl-12"
                    {...register("requestedAmount", { valueAsNumber: true })}
                  />
                </InputPrefix>
                <FieldError message={errors.requestedAmount?.message} />
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="installments">Parcelamento</Label>
                <Controller
                  name="installments"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value == null ? undefined : String(field.value)}
                      onValueChange={(value) => field.onChange(Number(value))}
                    >
                      <div className="relative">
                        <Calendar className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <SelectTrigger
                          id="installments"
                          className="w-full pl-9"
                          aria-invalid={!!errors.installments}
                        >
                          <SelectValue placeholder="Selecione o prazo" />
                        </SelectTrigger>
                      </div>
                      <SelectContent>
                        {INSTALLMENT_OPTIONS.map((option) => (
                          <SelectItem key={option} value={String(option)}>
                            {option} meses
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError message={errors.installments?.message} />
              </div>
            </div>

            <div className="grid gap-1.5">
              <Controller
                name="consent"
                control={control}
                render={({ field }) => (
                  <div className="flex gap-2">
                    <Checkbox
                      id="consent"
                      checked={field.value === true}
                      onCheckedChange={(checked) => field.onChange(checked === true)}
                      aria-invalid={!!errors.consent}
                      className="mt-0.5 rounded border-input data-[state=checked]:border-primary data-[state=checked]:bg-primary"
                    />
                    <Label htmlFor="consent" className="font-normal text-muted-foreground">
                      Autorizo o tratamento dos meus dados pessoais conforme a LGPD.
                    </Label>
                  </div>
                )}
              />
              <FieldError message={errors.consent?.message} />
            </div>

            <div className="flex flex-col gap-3">
              <Button
                type="submit"
                disabled={submitting}
                className="h-11 w-full gap-2 rounded-lg bg-primary text-base font-medium hover:bg-primary/90"
              >
                {submitting ? (
                  <>
                    <LoaderCircle className="animate-spin" />
                    Enviando…
                  </>
                ) : (
                  <>
                    Simular empréstimo
                    <ArrowRight className="size-4" />
                  </>
                )}
              </Button>

              {showReset ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  className="h-11 w-full rounded-lg"
                >
                  Nova simulação
                </Button>
              ) : null}
            </div>

            <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <Lock className="size-3" />
              Seus dados estão seguros e são usados apenas nesta simulação.
            </p>
          </form>
        </CardContent>
      </Card>

    </div>
  );
}
