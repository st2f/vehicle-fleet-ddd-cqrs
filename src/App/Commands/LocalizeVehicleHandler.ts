import { Location } from "../../Domain/Location";
import { Vehicle } from "../../Domain/Vehicle";
import { FleetNotFoundError } from "../errors";
import { FleetRepository } from "../Ports/FleetRepository";
import { LocalizeVehicleCommand } from "./LocalizeVehicleCommand";

export class LocalizeVehicleHandler {
  constructor(private readonly fleetRepository: FleetRepository) {}

  async handle(command: LocalizeVehicleCommand): Promise<void> {
    const fleet = await this.fleetRepository.findById(command.fleetId);

    if (fleet === undefined) {
      throw new FleetNotFoundError(command.fleetId);
    }

    const vehicle = new Vehicle(command.vehiclePlateNumber);
    const location = new Location(
      command.latitude,
      command.longitude,
      command.altitude,
    );

    fleet.park(vehicle, location);

    await this.fleetRepository.save(fleet);
  }
}
