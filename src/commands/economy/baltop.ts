import { EmbedBuilder } from 'discord.js';
import { stripIndents } from 'common-tags';
import { Command, CommandContext } from '../../../deps.ts';
import { db } from '../../index.ts';

export default class BaltopCommand extends Command {
  override name = 'baltop';
  override category = 'economy';
  override description = 'Returns the leaderboard';

  override async execute(ctx: CommandContext) {
    // deno-lint-ignore no-explicit-any
    const result: any[] = db.prepare('SELECT * FROM wallets ORDER BY money DESC LIMIT 10').all();

    let description = '';

    for (let i = 0; i < result.length; i++) {
      description += `${i + 1}. ${await ctx.guild?.members.fetch(result[i].id)}: ${result[i].money}\n`
    }

    const balEmbed = new EmbedBuilder()
      .setTitle('Balance Top')
      .setFooter({ text: ctx.client.user?.username ?? '', iconURL: ctx.client.user?.displayAvatarURL() })
      .setColor(0x00FF00)
      .setTimestamp()
      .setDescription(stripIndents`${description}`);

    ctx.channel.send({ embeds: [ balEmbed ] });
  }
}