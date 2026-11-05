import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGO_URL);
await client.connect();
export const mdb = client.db(process.env.MONGO_DB);
await mdb.collection('waste_logs').createIndex({ food_id: 1, waste_id: 1 }, { unique: true });