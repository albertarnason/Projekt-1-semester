import { upload } from 'pg-upload';
import pg from 'pg';
import dotenv from 'dotenv';


dotenv.config();
console.log('Connecting to database', process.env.PG_DATABASE);
const db = new pg.Pool({
    host:     process.env.PG_HOST,
    port:     parseInt(process.env.PG_PORT),
    database: process.env.PG_DATABASE,
    user:     process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    ssl:      { rejectUnauthorized: false },
});

const dbResult = await db.query('select now()');
console.log('Database connection established on', dbResult.rows[0].now);

console.log('Recreating tables...');

await db.query(`
    drop table if exists filmskuespillere;
    drop table if exists kritikeranmeldelser;
    drop table if exists filmstreamingtjenester;
    drop table if exists credits;
    drop table if exists trailer;
    drop table if exists kommentarer;
    drop table if exists brugeranmeldelser;
    drop table if exists film_playlists;
-- primary keys UNDER references OVER
    drop table if exists streamingtjenester;
    drop table if exists kritikere;
    drop table if exists film;
    drop table if exists kategorier;
    drop table if exists skuespillere;
    drop table if exists brugere;
`);

await db.query(`
    create table kategorier (
      kategori_id int primary key,
      kategori_desc text,
      kategori_navn text
    );
`);

await upload(
    db,
    'db/kategorier.csv',
    'copy kategorier from stdin with csv header'
);

