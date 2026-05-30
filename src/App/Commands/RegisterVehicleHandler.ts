import { Vehicle } from "../../Domain/Vehicle";
import { FleetNotFoundError } from "../errors";
import { FleetRepository } from "../Ports/FleetRepository";
import { RegisterVehicleCommand } from "./RegisterVehicleCommand";

export class RegisterVehicleHandler {
  constructor(private readonly fleetRepository: FleetRepository) {}

  async handle(command: RegisterVehicleCommand): Promise<void> {
    const fleet = await this.fleetRepository.findById(command.fleetId);

    if (fleet === undefined) {
      throw new FleetNotFoundError(command.fleetId);
    }

    fleet.register(new Vehicle(command.vehiclePlateNumber));

    await this.fleetRepository.save(fleet);
  }
}
