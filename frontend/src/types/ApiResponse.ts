export interface ApiResponse<T = any> {
  cod_retorno: 0 | 1;
  mensagem: string;
  data?: T;
}
