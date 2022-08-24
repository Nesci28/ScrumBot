import { TextChannel } from "discord.js";
import { shuffle } from "lodash";

export class Commands {
  constructor(private readonly channel: TextChannel) {}

  public async createScrumOrder(usernames: string[]): Promise<void> {
    if (!this.channel) {
      throw new Error("Missing channel");
    }

    const randomizedUsernames = shuffle(usernames);
    this.channel.send(randomizedUsernames.join(" -> "));
  }
}
