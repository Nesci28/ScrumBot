import { TextChannel } from "discord.js";
import { shuffle } from "lodash";

export class Commands {
  private isTroll = false;

  constructor(private readonly channel: TextChannel) {
    this.isTroll = process.env.TROLL_VINCENT === "true";
  }

  public async createScrumOrder(usernames: string[]): Promise<void> {
    if (!this.channel) {
      throw new Error("Missing channel");
    }

    const randomizedUsernames = shuffle(usernames);
    const trolled = this.isTroll
      ? this.trollVincent(randomizedUsernames)
      : randomizedUsernames;
    this.channel.send(trolled.join(" -> "));
  }

  private trollVincent(usernames: string[]): string[] {
    const indexOfVincent = usernames.indexOf("Vincent");
    usernames.splice(indexOfVincent, 1);
    usernames.push("Vincent");
    return usernames;
  }
}
