import { mdb } from './mongo.js';

export const notify = (user_id, message) =>
  mdb.collection('notifications').insertOne({
    user_id,
    message,
    read: false,
    created_at: new Date(),
  });