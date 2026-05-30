export class VehicleAlreadyRegisteredError extends Error {
  constructor(plateNumber: string) {
    super(
      `Vehicle with plate number ${plateNumber} is already registered in this fleet`,
    );
  }
}

export class VehicleNotRegisteredError extends Error {
  constructor(plateNumber: string) {
    super(`Vehicle with plate number ${plateNumber} is not registered in this fleet`);
  }
}

export class VehicleAlreadyParkedAtLocationError extends Error {
  constructor(plateNumber: string) {
    super(`Vehicle with plate number ${plateNumber} is already parked at this location`);
  }
}

export class BlankVehicleLicensePlateError extends Error {
  constructor() {
    super("Vehicle license plate cannot be blank");
  }
}
