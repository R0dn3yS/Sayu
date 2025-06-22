import { EmbedBuilder, TextChannel } from 'discord.js';
import { stripIndents } from 'common-tags';
import { Command, CommandContext, } from '../../../deps.ts';
import { getSeconds } from '../../utils/time.ts';

export default class TimeoutCommand extends Command {
  override name = 'timeout';
  override category = 'admin';
  override description = 'Returns the leaderboard';
  override ownerOnly = true;

  override execute(ctx: CommandContext) {
    const tMember = ctx.message.mentions.members?.first();
    const time = getSeconds(ctx.args[1]) * 1000;
    const reason = ctx.args.slice(2).join(' ');

    if (!tMember) {
      return ctx.channel.send('No valid user mentioned.');
    }

    tMember.timeout(time, reason).catch((e) => {
      console.error(e);
      return ctx.message.reply('I cannot timeout this user');
    });

    const aLog = ctx.guild?.channels.resolve('535389016338464771') as TextChannel;
    
      const dEmbed = new EmbedBuilder()
        .setTitle('Member Timeout')
        .setThumbnail(tMember.displayAvatarURL() ?? '')
        .setFooter({ text: ctx.client.user?.username ?? '', iconURL: ctx.client.user?.displayAvatarURL() })
        .setColor(0xFF0000)
        .setDescription(stripIndents`**> Timed out member** ${tMember}
          **> Timed out by:** ${ctx.author}
          **> Reason:** ${reason}
          **> Timed out for:** ${time} seconds`)
        .setTimestamp();
    
      return aLog.send({ embeds: [ dEmbed ]});
  }
}