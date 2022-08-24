import { Client } from "./client";

const { TOKEN, CHANNEL_ID, GUILD_ID } = process.env;
if (!TOKEN || !CHANNEL_ID || !GUILD_ID) {
  throw new Error("Missing variables");
}

const client = new Client(TOKEN, CHANNEL_ID, GUILD_ID);
client.init();
