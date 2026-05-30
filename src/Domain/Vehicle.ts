import { BlankVehicleLicensePlateError } from "./errors";

export class Vehicle {
  public readonly licensePlate: string;

  constructor(licensePlate: string) {
    const normalizedLicensePlate = licensePlate.trim().toUpperCase();

    if (normalizedLicensePlate === "") {
      throw new BlankVehicleLicensePlateError();
    }

    this.licensePlate = normalizedLicensePlate;
  }

  static create(licensePlate: string): Vehicle {
    return new Vehicle(licensePlate);
  }
}
