export class FleetNotFoundError extends Error {
  constructor(fleetId: string) {
    super(`Fleet with id ${fleetId} was not found`);
  }
}
