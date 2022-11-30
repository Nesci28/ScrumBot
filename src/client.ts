import {
  Client as DiscordClient,
  GatewayIntentBits,
  Guild,
  TextChannel,
} from "discord.js";
import cron from "node-cron";

import { Commands } from "./commands";

export class Client {
  private discordClient: DiscordClient<boolean>;

  private commands?: Commands;

  private guild?: Guild;

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
      this.guild = await this.discordClient.guilds.fetch(this.guildId);

      this.commands = new Commands(channel);

      cron.schedule("57 8 * * 1-5", async () => {
        const usernames = await this.getChannelUsernames();
        await this.commands?.createScrumOrder(usernames);
      });
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

      const usernames = await this.getChannelUsernames();

      switch (content) {
        case "!scrum":
          await this.commands.createScrumOrder(usernames);
          break;
        default:
      }
    });

    this.discordClient.login(this.token);
  }

  private async getChannelUsernames(): Promise<string[]> {
    if (!this.guild) {
      throw new Error("Guild is missing");
    }

    const members = await this.guild.members.fetch();
    const membersMap = new Map();
    members?.forEach((x) => {
      const { nickname, user } = x;
      const name = nickname || user.username;
      membersMap.set(user.username, name);
    });

    const { members: channelMembers } =
      (await this.discordClient.channels.fetch(this.channelId)) as TextChannel;
    const usernames = channelMembers
      .map((x) => {
        const { user } = x;
        const { bot, username } = user;
        if (bot) {
          return;
        }

        return membersMap.get(username);
      })
      .filter(Boolean) as string[];

    return usernames;
  }
}
