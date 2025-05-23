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
    drop table if exists tesla_factories;
    drop table if exists tesla_stock;
    drop table if exists tariffs_trump;
    drop table if exists tesla_mining_partners;
    drop table if exists tesla_sales;
    drop table if exists tesla_component_supplier;
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
  "backend/data/tesla_factories.csv",
  "copy tesla_factories from stdin with csv header"
);

await db.query(`
    create table tesla_stock (
    date_close date,
    value_dollar double precision
    );
`);

await upload(
  db,
  "backend/data/tesla_stock.csv",
  "copy tesla_stock from stdin with csv header"
);

await db.query(`
    create table tariffs_trump (
    entity text,
    tariff_rate text,
    effective_date date,
    tariff_type text,
    notes text
    );
`);

await upload(
  db,
  "backend/data/tariffs_trump.csv",
  "copy tariffs_trump from stdin with csv header"
);

await db.query(`
    create table tesla_mining_partners (
   mining_partner text,
   Material text,
   Operations text,
   start_date text,
  Latitude double precision,
  Longitude double precision
    );
`);

await upload(
  db,
  "backend/data/tesla_mining_partners.csv",
  "copy tesla_mining_partners from stdin with csv header"
);

await db.query(`
    create table tesla_sales (
sales_quarter text,
country text,
sale_amount integer,
sales_year integer
    );
`);

await upload(
  db,
  "backend/data/tesla_sales.csv",
  "copy tesla_sales from stdin with csv header"
);

await db.query(`
    create table tesla_component_supplier (
Category text,
Component text,
Supplier text,
Origin text,
 Latitude double precision,
  Longitude double precision
    );
`);

await upload(
  db,
  "backend/data/tesla_component_supplier.csv",
  "copy tesla_component_supplier from stdin with csv header"
);