export class Location {
  constructor(
    public readonly latitude: number,
    public readonly longitude: number,
    public readonly altitude?: number,
  ) {
    if (!Number.isFinite(latitude)) {
      throw new Error("Invalid latitude");
    }

    if (latitude < -90 || latitude > 90) {
      throw new Error("Invalid latitude");
    }

    if (!Number.isFinite(longitude)) {
      throw new Error("Invalid longitude");
    }

    if (longitude < -180 || longitude > 180) {
      throw new Error("Invalid longitude");
    }

    if (altitude !== undefined && !Number.isFinite(altitude)) {
      throw new Error("Invalid altitude");
    }
  }

  equals(other: Location): boolean {
    return (
      this.latitude === other.latitude &&
      this.longitude === other.longitude &&
      this.altitude === other.altitude
    );
  }
}
