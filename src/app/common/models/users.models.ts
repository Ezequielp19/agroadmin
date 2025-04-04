export interface UserI {
  id: string;
  subscriptionId?: string; // Opcional para usuarios gratuitos
  nombre: string;
  dni: number;
  active: boolean;
  telefono: number;
}
