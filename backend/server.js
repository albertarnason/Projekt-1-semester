import pg from 'pg';
import dotenv from 'dotenv';


dotenv.config();

console.log('Connecting to the database...', process.env.PG_DATABASE);
const db = new pg.Pool({
    host:     process.env.PG_HOST,
    port:     parseInt(process.env.PG_PORT),
    database: process.env.PG_DATABASE,
    user:     process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    ssl:      { rejectUnauthorized: false },
});
const dbResult = await db.query('select now() as now');
console.log('Database connection established on', dbResult.rows[0].now);

import express from 'express';

console.log('Initialising webserver...');
const port = 3003;
const server = express();
server.use(express.static('frontend'));
server.use(onEachRequest)
server.get('/api/teslaFactories', teslaFactories);
server.get('/api/MiningPartners', MiningPartners);
server.listen(port, onServerReady);

function onEachRequest(request, response, next) {
    console.log(new Date(), request.method, request.url);
    next();
}

function onServerReady() {
    console.log('Webserver running on port', port);
}

async function teslaFactories(request, response) {
    const dbResult = await db.query('select * from tesla_factories');
    console.log(dbResult)
    response.json(dbResult.rows);
}

async function MiningPartners(request, response) {
    const dbResult = await db.query('select * from tesla_mining_partners ');
    console.log(dbResult)
    response.json(dbResult.rows);
}