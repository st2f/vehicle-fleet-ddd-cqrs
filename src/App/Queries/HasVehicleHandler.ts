import { FleetNotFoundError } from "../errors";
import { FleetRepository } from "../Ports/FleetRepository";
import { HasVehicleQuery } from "./HasVehicleQuery";

export class HasVehicleHandler {
  constructor(private readonly fleetRepository: FleetRepository) {}

  async handle(query: HasVehicleQuery): Promise<boolean> {
    const fleet = await this.fleetRepository.findById(query.fleetId);

    if (fleet === undefined) {
      throw new FleetNotFoundError(query.fleetId);
    }

    return fleet.hasVehicle(query.vehiclePlateNumber);
  }
}
