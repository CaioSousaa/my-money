import { HOURLY_RATE, TRANSPORT_ALLOWANCE } from '../../../../domain/entities/earnings-rates';

export interface ScheduleForEarnings {
  horas_cadastradas_dia: number;
}

export interface CalculateEarningsOutput {
  total_horas: number;
  total_dias: number;
  transporte: boolean;
  valor_horas: number;
  valor_transporte: number;
  total: number;
}

function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function calculateEarnings(
  schedules: ScheduleForEarnings[],
  transporte: boolean,
): CalculateEarningsOutput {
  const total_horas = schedules.reduce((sum, schedule) => sum + schedule.horas_cadastradas_dia, 0);
  const total_dias = schedules.length;

  const valor_horas = round2(total_horas * HOURLY_RATE);
  const valor_transporte = round2(transporte ? total_dias * TRANSPORT_ALLOWANCE : 0);
  const total = round2(valor_horas + valor_transporte);

  return { total_horas, total_dias, transporte, valor_horas, valor_transporte, total };
}
