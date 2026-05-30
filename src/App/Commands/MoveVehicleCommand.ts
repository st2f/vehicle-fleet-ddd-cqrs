export type MoveVehicleCommand = {
  fleetId: string;
  vehiclePlateNumber: string;
  latitude: number;
  longitude: number;
  altitude?: number;
};
