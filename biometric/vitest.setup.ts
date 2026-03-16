import { beforeAll, afterAll, beforeEach } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongo: MongoMemoryServer | null = null;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongo.getUri();
  process.env.RP_ID = "localhost";
  process.env.RP_NAME = "My App";
  process.env.EXPECTED_ORIGIN = "http://localhost:3000";
  process.env.JWT_SECRET = "test-secret";
  process.env.JWT_TTL = "1h";

  await mongoose.connect(process.env.MONGODB_URI);
});

beforeEach(async () => {
  if (!mongoose.connection.db) return;
  const collections = await mongoose.connection.db.collections();
  for (const collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongo) {
    await mongo.stop();
  }
});
