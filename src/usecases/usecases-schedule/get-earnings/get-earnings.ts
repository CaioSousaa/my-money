import { IScheduleRepository } from '../../ports/ISchedule-repository';
import { ICompanyRepository } from '../../ports/ICompany-repository';
import { calculateEarnings, CalculateEarningsOutput } from './functions/calculate-earnings';

export class GetEarnings {
  constructor(
    private readonly scheduleRepository: IScheduleRepository,
    private readonly companyRepository: ICompanyRepository,
  ) {}

  async execute(user_id: string): Promise<CalculateEarningsOutput> {
    const schedules = await this.scheduleRepository.listByUser(user_id);
    const company = await this.companyRepository.findByUserId(user_id);

    return calculateEarnings(schedules, company?.transporte ?? false);
  }
}
