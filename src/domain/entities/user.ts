export interface UserProps {
  id?: string;
  nome: string;
  matricula: string;
  senha: string;
  created_at?: Date;
}

export class User {
  public id?: string;
  public nome!: string;
  public matricula!: string;
  public senha!: string;
  public created_at: Date;

  private constructor(props: UserProps) {
    Object.assign(this, props);
    this.created_at = props.created_at ?? new Date();
  }

  static create(props: UserProps): User {
    return new User(props);
  }
}
