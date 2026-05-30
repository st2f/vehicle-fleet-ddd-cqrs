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
}
