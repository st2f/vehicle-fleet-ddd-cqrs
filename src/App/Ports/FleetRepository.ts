import { Fleet } from "../../Domain/Fleet";

export interface FleetRepository {
  save(fleet: Fleet): Promise<void>;
  findById(fleetId: string): Promise<Fleet | undefined>;
}
