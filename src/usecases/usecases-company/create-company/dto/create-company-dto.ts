export interface CreateCompanyDTO {
  user_id: string;
  nome_empresa: string;
  observacoes?: string;
  transporte?: boolean;
}
