import { FleetRepository } from "../Ports/FleetRepository";
import { IdGenerator } from "../Ports/IdGenerator";
import { Fleet } from "../../Domain/Fleet";
import { CreateFleetCommand } from "./CreateFleetCommand";

export class CreateFleetHandler {
  constructor(
    private readonly fleetRepository: FleetRepository,
    private readonly idGenerator: IdGenerator,
  ) {}

  async handle(command: CreateFleetCommand): Promise<string> {
    const fleetId = this.idGenerator.generate();
    const fleet = Fleet.create(fleetId, command.userId);

    await this.fleetRepository.save(fleet);

    return fleetId;
  }
}
