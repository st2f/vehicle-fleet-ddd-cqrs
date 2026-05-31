export type LocalizeVehicleCommand = {
  fleetId: string;
  vehiclePlateNumber: string;
  latitude: number;
  longitude: number;
  altitude?: number;
};
