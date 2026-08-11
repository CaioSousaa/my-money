export interface CompanyProps {
  id?: string;
  user_id: string;
  nome_empresa: string;
  observacoes?: string;
  transporte?: boolean;
  created_at?: Date;
}

export class Company {
  public id?: string;
  public user_id!: string;
  public nome_empresa!: string;
  public observacoes?: string;
  public transporte!: boolean;
  public created_at: Date;

  private constructor(props: CompanyProps) {
    Object.assign(this, props);
    this.transporte = props.transporte ?? false;
    this.created_at = props.created_at ?? new Date();
  }

  static create(props: CompanyProps): Company {
    return new Company(props);
  }
}
