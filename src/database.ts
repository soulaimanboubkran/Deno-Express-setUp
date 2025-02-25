import { DataSource ,load} from "./deps.ts";


const env = await load();
export const AppDataSource = new DataSource({
    type: "postgres",
    host: env["POSTGRES_HOST"] || "localhost",
    port: Number(env["POSTGRES_PORT"]) || 5432,
    username: env["POSTGRES_USER"],
    password: env["POSTGRES_PASSWORD"],
    database: env["POSTGRES_DB"],
    synchronize: true,
    logging: false,
    entities: [],
    migrations: [],
    subscribers: [],
});
