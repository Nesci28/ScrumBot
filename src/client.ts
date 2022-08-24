import {
  Client as DiscordClient,
  GatewayIntentBits,
  TextChannel,
} from "discord.js";

import { Commands } from "./commands";

export class Client {
  private discordClient: DiscordClient<boolean>;

  private commands?: Commands;

  constructor(
    private readonly token: string,
    private readonly channelId: string,
    private readonly guildId: string,
  ) {
    this.discordClient = new DiscordClient({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
      ],
    });
  }

  public init(): void {
    this.discordClient.once("ready", async () => {
      // eslint-disable-next-line no-console
      console.log("Ready");
      const channel = (await this.discordClient.channels.fetch(
        this.channelId,
      )) as TextChannel;
      const guild = await this.discordClient.guilds.fetch(this.guildId);

      this.commands = new Commands(channel, guild);
    });

    this.discordClient.on("messageCreate", async (msg) => {
      if (!this.commands) {
        throw new Error("Commands class is missing");
      }

      const { channelId, guildId, content } = msg;
      if (channelId !== this.channelId || guildId !== this.guildId) {
        return;
      }

      const isCommand = content.startsWith("!");
      if (!isCommand) {
        return;
      }

      switch (content) {
        case "!scrum":
          await this.commands.createScrumOrder();
          break;
        default:
      }
    });

    this.discordClient.login(this.token);
  }
}
