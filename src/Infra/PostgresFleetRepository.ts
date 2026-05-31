import { Pool, PoolConfig } from "pg";
import { Fleet, FleetSnapshot } from "../Domain/Fleet";
import { Location } from "../Domain/Location";
import { FleetRepository } from "../App/Ports/FleetRepository";

type FleetRow = {
  id: string;
  user_id: string;
};

type VehicleRow = {
  plate_number: string;
  latitude: number | null;
  longitude: number | null;
  altitude: number | null;
};

export class PostgresFleetRepository implements FleetRepository {
  private readonly pool: Pool;

  constructor(config: PoolConfig | string) {
    this.pool =
      typeof config === "string"
        ? new Pool({ connectionString: config })
        : new Pool(config);
  }

  async migrate(): Promise<void> {
    await this.pool.query(`
      create table if not exists fleets (
        id text primary key,
        user_id text not null
      );

      create table if not exists fleet_vehicles (
        fleet_id text not null references fleets(id) on delete cascade,
        plate_number text not null,
        latitude double precision,
        longitude double precision,
        altitude double precision,
        primary key (fleet_id, plate_number)
      );
    `);
  }

  async save(fleet: Fleet): Promise<void> {
    const snapshot = fleet.toSnapshot();
    const client = await this.pool.connect();

    try {
      await client.query("begin");
      await client.query(
        `
          insert into fleets (id, user_id)
          values ($1, $2)
          on conflict (id) do update set user_id = excluded.user_id
        `,
        [snapshot.id, snapshot.userId],
      );
      await client.query("delete from fleet_vehicles where fleet_id = $1", [
        snapshot.id,
      ]);

      for (const vehicle of snapshot.vehicles) {
        await client.query(
          `
            insert into fleet_vehicles (
              fleet_id,
              plate_number,
              latitude,
              longitude,
              altitude
            )
            values ($1, $2, $3, $4, $5)
          `,
          [
            snapshot.id,
            vehicle.plateNumber,
            vehicle.location?.latitude ?? null,
            vehicle.location?.longitude ?? null,
            vehicle.location?.altitude ?? null,
          ],
        );
      }

      await client.query("commit");
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }
  }

  async findById(fleetId: string): Promise<Fleet | undefined> {
    const fleetResult = await this.pool.query<FleetRow>(
      "select id, user_id from fleets where id = $1",
      [fleetId],
    );
    const fleetRow = fleetResult.rows[0];

    if (fleetRow === undefined) {
      return undefined;
    }

    const vehicleResult = await this.pool.query<VehicleRow>(
      `
        select plate_number, latitude, longitude, altitude
        from fleet_vehicles
        where fleet_id = $1
        order by plate_number
      `,
      [fleetId],
    );

    const snapshot: FleetSnapshot = {
      id: fleetRow.id,
      userId: fleetRow.user_id,
      vehicles: vehicleResult.rows.map((vehicleRow) => ({
        plateNumber: vehicleRow.plate_number,
        location:
          vehicleRow.latitude === null || vehicleRow.longitude === null
            ? undefined
            : new Location(
                vehicleRow.latitude,
                vehicleRow.longitude,
                vehicleRow.altitude ?? undefined,
              ),
      })),
    };

    return Fleet.reconstitute(snapshot);
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}
