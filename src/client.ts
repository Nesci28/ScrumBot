import {
  Client as DiscordClient,
  GatewayIntentBits,
  Message,
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

      this.commands = new Commands(channel);
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

      const usernames = await this.getChannelUsernames(msg);

      switch (content) {
        case "!scrum":
          await this.commands.createScrumOrder(usernames);
          break;
        default:
      }
    });

    this.discordClient.login(this.token);
  }

  private async getChannelUsernames(msg: Message): Promise<string[]> {
    const members = await msg.guild?.members.list();
    const membersMap = new Map();
    members?.forEach((x) => {
      const { nickname, user } = x;
      membersMap.set(user.username, nickname);
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
