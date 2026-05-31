import { setWorldConstructor, World } from "@cucumber/cucumber";
import { Location } from "../../src/Domain/Location";
import { InMemoryFleetRepository } from "../../src/Infra/InMemoryFleetRepository";
import { FleetRepository } from "../../src/App/Ports/FleetRepository";
import { CreateFleetHandler } from "../../src/App/Commands/CreateFleetHandler";
import { RegisterVehicleHandler } from "../../src/App/Commands/RegisterVehicleHandler";
import { LocalizeVehicleHandler } from "../../src/App/Commands/LocalizeVehicleHandler";
import { HasVehicleHandler } from "../../src/App/Queries/HasVehicleHandler";
import { LocateVehicleHandler } from "../../src/App/Queries/LocateVehicleHandler";

type RepositoryFactory = () => Promise<FleetRepository>;
type Cleanup = () => Promise<void>;

export class FleetWorld extends World {
  private fleetRepository: FleetRepository = new InMemoryFleetRepository();
  private readonly idGenerator = new SequentialIdGenerator();

  private createFleetHandler = new CreateFleetHandler(
    this.fleetRepository,
    this.idGenerator,
  );

  private registerVehicleHandler = new RegisterVehicleHandler(
    this.fleetRepository,
  );

  private localizeVehicleHandler = new LocalizeVehicleHandler(
    this.fleetRepository,
  );

  private hasVehicleHandler = new HasVehicleHandler(
    this.fleetRepository,
  );

  private locateVehicleHandler = new LocateVehicleHandler(
    this.fleetRepository,
  );

  private repositoryFactory?: RepositoryFactory;
  private readonly cleanups: Cleanup[] = [];

  myFleetId: string = "";
  otherFleetId: string = "";
  vehiclePlateNumber: string = "";
  location?: Location;
  caughtError?: unknown;

  useRepository(
    fleetRepository: FleetRepository,
    repositoryFactory?: RepositoryFactory,
  ): void {
    this.fleetRepository = fleetRepository;
    this.repositoryFactory = repositoryFactory;
    this.createFleetHandler = new CreateFleetHandler(
      this.fleetRepository,
      this.idGenerator,
    );
    this.registerVehicleHandler = new RegisterVehicleHandler(
      this.fleetRepository,
    );
    this.localizeVehicleHandler = new LocalizeVehicleHandler(
      this.fleetRepository,
    );
    this.hasVehicleHandler = new HasVehicleHandler(this.fleetRepository);
    this.locateVehicleHandler = new LocateVehicleHandler(this.fleetRepository);
  }

  async reloadRepository(): Promise<void> {
    if (this.repositoryFactory === undefined) {
      return;
    }

    this.useRepository(
      await this.repositoryFactory(),
      this.repositoryFactory,
    );
  }

  addCleanup(cleanup: Cleanup): void {
    this.cleanups.push(cleanup);
  }

  async cleanup(): Promise<void> {
    while (this.cleanups.length > 0) {
      const cleanup = this.cleanups.pop()!;
      await cleanup();
    }
  }

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
