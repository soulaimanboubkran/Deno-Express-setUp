import { DataSource } from "./deps.ts";


export const AppDataSource = new DataSource({
    type: "postgres",
    host: Deno.env.get("DB_HOST") || "localhost",
    port: Number(Deno.env.get("DB_PORT")) || 5432,
    username: Deno.env.get("DB_USER") || "postgres",
    password: Deno.env.get("DB_PASSWORD") || "postgres",
    database: Deno.env.get("DB_NAME") || "postgres",
    synchronize: true,
    logging: false,
    entities: [
        
    ],
    migrations: [],
    subscribers: [],
});
