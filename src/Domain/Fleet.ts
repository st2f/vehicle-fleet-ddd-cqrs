import { Location } from "./Location";
import { Vehicle } from "./Vehicle";
import {
  VehicleAlreadyParkedAtLocationError,
  VehicleAlreadyRegisteredError,
  VehicleNotRegisteredError,
} from "./errors";

export class Fleet {
  private readonly vehicles = new Set<string>();
  private readonly vehicleLocations = new Map<string, Location>();

  constructor(
    public readonly id: string,
    public readonly userId: string,
  ) {}

  static create(id: string, userId: string = "user-1"): Fleet {
    return new Fleet(id, userId);
  }

  static reconstitute(snapshot: FleetSnapshot): Fleet {
    const fleet = new Fleet(snapshot.id, snapshot.userId);

    for (const vehicle of snapshot.vehicles) {
      fleet.vehicles.add(vehicle.plateNumber);

      if (vehicle.location !== undefined) {
        fleet.vehicleLocations.set(vehicle.plateNumber, vehicle.location);
      }
    }

    return fleet;
  }

  register(vehicle: Vehicle): void {
    const plateNumber = vehicle.licensePlate;

    if (this.vehicles.has(plateNumber)) {
      throw new VehicleAlreadyRegisteredError(plateNumber);
    }

    this.vehicles.add(plateNumber);
  }

  hasVehicle(plateNumber: string): boolean {
    return this.vehicles.has(plateNumber);
  }

  clone(): Fleet {
    const fleet = new Fleet(this.id, this.userId);

    for (const plateNumber of this.vehicles) {
      fleet.vehicles.add(plateNumber);
    }

    for (const [plateNumber, location] of this.vehicleLocations) {
      fleet.vehicleLocations.set(plateNumber, location);
    }

    return fleet;
  }

  park(vehicle: Vehicle, location: Location): void {
    const plateNumber = vehicle.licensePlate;

    if (!this.vehicles.has(plateNumber)) {
      throw new VehicleNotRegisteredError(plateNumber);
    }

    const currentLocation = this.vehicleLocations.get(plateNumber);
    if (currentLocation?.equals(location)) {
      throw new VehicleAlreadyParkedAtLocationError(plateNumber);
    }

    this.vehicleLocations.set(plateNumber, location);
  }

  currentLocationOf(vehicle: Vehicle): Location | undefined {
    return this.vehicleLocations.get(vehicle.licensePlate);
  }

  toSnapshot(): FleetSnapshot {
    return {
      id: this.id,
      userId: this.userId,
      vehicles: [...this.vehicles].map((plateNumber) => ({
        plateNumber,
        location: this.vehicleLocations.get(plateNumber),
      })),
    };
  }
}

export type FleetSnapshot = {
  id: string;
  userId: string;
  vehicles: VehicleSnapshot[];
};

type VehicleSnapshot = {
  plateNumber: string;
  location?: Location;
};
