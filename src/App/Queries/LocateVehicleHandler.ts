import { Location } from "../../Domain/Location";
import { Vehicle } from "../../Domain/Vehicle";
import { FleetNotFoundError } from "../errors";
import { FleetRepository } from "../Ports/FleetRepository";
import { LocateVehicleQuery } from "./LocateVehicleQuery";

export class LocateVehicleHandler {
  constructor(private readonly fleetRepository: FleetRepository) {}

  async handle(query: LocateVehicleQuery): Promise<Location | undefined> {
    const fleet = await this.fleetRepository.findById(query.fleetId);

    if (fleet === undefined) {
      throw new FleetNotFoundError(query.fleetId);
    }

    return fleet.currentLocationOf(new Vehicle(query.vehiclePlateNumber));
  }
}
