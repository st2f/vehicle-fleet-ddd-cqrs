import { FleetRepository } from "../App/Ports/FleetRepository";
import { Fleet } from "../Domain/Fleet";

export class InMemoryFleetRepository implements FleetRepository {
  private readonly fleets = new Map<string, Fleet>();

  async save(fleet: Fleet): Promise<void> {
    this.fleets.set(fleet.id, fleet.clone());
  }

  async findById(fleetId: string): Promise<Fleet | undefined> {
    return this.fleets.get(fleetId)?.clone();
  }
}
