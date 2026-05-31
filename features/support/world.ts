import { setWorldConstructor, World } from "@cucumber/cucumber";
import { Location } from "../../src/Domain/Location";
import { InMemoryFleetRepository } from "../../src/Infra/InMemoryFleetRepository";
import { CreateFleetHandler } from "../../src/App/Commands/CreateFleetHandler";
import { RegisterVehicleHandler } from "../../src/App/Commands/RegisterVehicleHandler";
import { LocalizeVehicleHandler } from "../../src/App/Commands/LocalizeVehicleHandler";
import { HasVehicleHandler } from "../../src/App/Queries/HasVehicleHandler";
import { LocateVehicleHandler } from "../../src/App/Queries/LocateVehicleHandler";

export class FleetWorld extends World {
  private readonly fleetRepository = new InMemoryFleetRepository();

  private readonly createFleetHandler = new CreateFleetHandler(
    this.fleetRepository,
    new SequentialIdGenerator(),
  );

  private readonly registerVehicleHandler = new RegisterVehicleHandler(
    this.fleetRepository,
  );

  private readonly localizeVehicleHandler = new LocalizeVehicleHandler(
    this.fleetRepository,
  );

  private readonly hasVehicleHandler = new HasVehicleHandler(
    this.fleetRepository,
  );

  private readonly locateVehicleHandler = new LocateVehicleHandler(
    this.fleetRepository,
  );

  myFleetId: string = "";
  otherFleetId: string = "";
  vehiclePlateNumber: string = "";
  location?: Location;
  caughtError?: unknown;

  async createMyFleet(): Promise<void> {
    this.myFleetId = await this.createFleetHandler.handle({ userId: "user-1" });
  }

  async createOtherFleet(): Promise<void> {
    this.otherFleetId = await this.createFleetHandler.handle({
      userId: "user-2",
    });
  }

  createVehicle(): void {
    this.vehiclePlateNumber = "AA-123-BB";
  }

  createLocation(): void {
    this.location = new Location(48.8566, 2.3522);
  }

  async registerVehicleIntoMyFleet(): Promise<void> {
    await this.registerVehicleHandler.handle({
      fleetId: this.myFleetId!,
      vehiclePlateNumber: this.vehiclePlateNumber,
    });
  }

  async registerVehicleIntoOtherFleet(): Promise<void> {
    await this.registerVehicleHandler.handle({
      fleetId: this.otherFleetId!,
      vehiclePlateNumber: this.vehiclePlateNumber,
    });
  }

  async tryToRegisterVehicleIntoMyFleet(): Promise<void> {
    this.caughtError = undefined;

    try {
      await this.registerVehicleIntoMyFleet();
    } catch (error) {
      this.caughtError = error;
    }
  }

  async myFleetHasVehicle(): Promise<boolean> {
    return this.hasVehicleHandler.handle({
      fleetId: this.myFleetId,
      vehiclePlateNumber: this.vehiclePlateNumber,
    });
  }

  async parkMyVehicleAtLocation(): Promise<void> {
    await this.localizeVehicleHandler.handle({
      fleetId: this.myFleetId,
      vehiclePlateNumber: this.vehiclePlateNumber,
      latitude: this.location!.latitude,
      longitude: this.location!.longitude,
      altitude: this.location!.altitude,
    });
  }

  async tryToParkMyVehicleAtLocation(): Promise<void> {
    this.caughtError = undefined;

    try {
      await this.parkMyVehicleAtLocation();
    } catch (error) {
      this.caughtError = error;
    }
  }

  async currentLocationOfMyVehicle(): Promise<Location | undefined> {
    return this.locateVehicleHandler.handle({
      fleetId: this.myFleetId,
      vehiclePlateNumber: this.vehiclePlateNumber,
    });
  }
}

setWorldConstructor(FleetWorld);

class SequentialIdGenerator {
  private nextId = 1;

  generate(): string {
    return `fleet-${this.nextId++}`;
  }
}
