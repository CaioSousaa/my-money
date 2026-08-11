export interface ScheduleProps {
  id?: string;
  user_id: string;
  dia_cadastrado: Date;
  horas_cadastradas_dia: number;
  created_at?: Date;
}

export class Schedule {
  public id?: string;
  public user_id!: string;
  public dia_cadastrado!: Date;
  public horas_cadastradas_dia!: number;
  public created_at: Date;

  private constructor(props: ScheduleProps) {
    Object.assign(this, props);
    this.created_at = props.created_at ?? new Date();
  }

  static create(props: ScheduleProps): Schedule {
    return new Schedule(props);
  }
}
