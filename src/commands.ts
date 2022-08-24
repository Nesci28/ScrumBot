import { Guild, TextChannel } from "discord.js";
import { shuffle } from "lodash";

export class Commands {
  constructor(
    private readonly channel: TextChannel,
    private readonly guild: Guild,
  ) {}

  public async createScrumOrder(): Promise<void> {
    if (!this.guild || !this.channel) {
      throw new Error("Missing guild or channel");
    }

    const members = await this.guild.members.fetch();
    const usernames = members
      .map((x) => {
        const { user } = x;
        const { bot, username } = user;
        if (bot) {
          return;
        }

        return username;
      })
      .filter(Boolean);

    const randomizedUsernames = shuffle(usernames);
    this.channel.send(randomizedUsernames.join(" -> "));
  }
}
