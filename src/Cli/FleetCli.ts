import { CreateFleetHandler } from "../App/Commands/CreateFleetHandler";
import { LocalizeVehicleHandler } from "../App/Commands/LocalizeVehicleHandler";
import { RegisterVehicleHandler } from "../App/Commands/RegisterVehicleHandler";
import { FleetRepository } from "../App/Ports/FleetRepository";
import { InMemoryFleetRepository } from "../Infra/InMemoryFleetRepository";
import { RandomIdGenerator } from "./RandomIdGenerator";

type Print = (message: string) => void;

export class FleetCli {
  private readonly createFleetHandler: CreateFleetHandler;
  private readonly registerVehicleHandler: RegisterVehicleHandler;
  private readonly localizeVehicleHandler: LocalizeVehicleHandler;

  constructor(
    fleetRepository: FleetRepository = new InMemoryFleetRepository(),
    idGenerator = new RandomIdGenerator(),
  ) {
    this.createFleetHandler = new CreateFleetHandler(
      fleetRepository,
      idGenerator,
    );
    this.registerVehicleHandler = new RegisterVehicleHandler(fleetRepository);
    this.localizeVehicleHandler = new LocalizeVehicleHandler(fleetRepository);
  }

  async run(args: string[], print: Print = console.log): Promise<void> {
    const [command, ...commandArgs] = args;

    switch (command) {
      case "create":
        await this.createFleet(commandArgs, print);
        return;
      case "register-vehicle":
        await this.registerVehicle(commandArgs);
        return;
      case "localize-vehicle":
        await this.localizeVehicle(commandArgs);
        return;
      default:
        throw new CliUsageError(usage());
    }
  }

  private async createFleet(args: string[], print: Print): Promise<void> {
    const [userId] = args;

    if (args.length !== 1 || userId === "") {
      throw new CliUsageError("Usage: ./fleet create <userId>");
    }

    const fleetId = await this.createFleetHandler.handle({ userId });
    print(fleetId);
  }

  private async registerVehicle(args: string[]): Promise<void> {
    const [fleetId, vehiclePlateNumber] = args;

    if (args.length !== 2 || fleetId === "" || vehiclePlateNumber === "") {
      throw new CliUsageError(
        "Usage: ./fleet register-vehicle <fleetId> <vehiclePlateNumber>",
      );
    }

    await this.registerVehicleHandler.handle({ fleetId, vehiclePlateNumber });
  }

  private async localizeVehicle(args: string[]): Promise<void> {
    const [fleetId, vehiclePlateNumber, latitude, longitude, altitude] = args;

    if (
      args.length < 4 ||
      args.length > 5 ||
      fleetId === "" ||
      vehiclePlateNumber === ""
    ) {
      throw new CliUsageError(
        "Usage: ./fleet localize-vehicle <fleetId> <vehiclePlateNumber> lat lng [alt]",
      );
    }

    const parsedLatitude = parseCoordinate(latitude, "lat");
    const parsedLongitude = parseCoordinate(longitude, "lng");
    const parsedAltitude =
      altitude === undefined ? undefined : parseCoordinate(altitude, "alt");

    await this.localizeVehicleHandler.handle({
      fleetId,
      vehiclePlateNumber,
      latitude: parsedLatitude,
      longitude: parsedLongitude,
      altitude: parsedAltitude,
    });
  }
}

export class CliUsageError extends Error {}

function parseCoordinate(value: string, name: string): number {
  const coordinate = Number(value);

  if (!Number.isFinite(coordinate)) {
    throw new CliUsageError(`${name} must be a number`);
  }

  return coordinate;
}

function usage(): string {
  return [
    "Usage:",
    "  ./fleet create <userId>",
    "  ./fleet register-vehicle <fleetId> <vehiclePlateNumber>",
    "  ./fleet localize-vehicle <fleetId> <vehiclePlateNumber> lat lng [alt]",
  ].join("\n");
}
