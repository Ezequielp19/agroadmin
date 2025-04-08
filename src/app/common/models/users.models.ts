export interface UserI {
  id: string;
  subscriptionId?: string; // Opcional para usuarios gratuitos
  nombre: string;
  dni: string;
  active: boolean;
  telefono: number;
  email:string;
}
