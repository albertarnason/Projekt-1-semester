import { upload } from "pg-upload";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();
console.log("Connecting to database", process.env.PG_DATABASE);
const db = new pg.Pool({
  host: process.env.PG_HOST,
  port: parseInt(process.env.PG_PORT),
  database: process.env.PG_DATABASE,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  ssl: { rejectUnauthorized: false },
});

const dbResult = await db.query("select now()");
console.log("Database connection established on", dbResult.rows[0].now);

console.log("Recreating tables...");

await db.query(`
-- primary keys UNDER references OVER
    drop table if exists tesla_factories
`);

await db.query(`
    create table tesla_factories (
      Type text,
      Name text,
      City text,
      State text,
      Country text,
      Size_m2 integer,
      Focus text,
      Battery_Cell_Production text,
      Open_Date integer,
      notes text,
      Latitude double precision,
      Longitude double precision
    );
`);

await upload(
  db,
  "frontend/data/tesla_factories.csv",
  "copy tesla_factories from stdin with csv header"
);
