import { Command, CommandContext } from '../../../deps.ts';
import { player } from '../../index.ts';

export default class PlaynextCommand extends Command {
  override name = 'playnext';
  override category = 'music';
  override description = 'Places song next in the queue';

  override async execute(ctx: CommandContext) {
    const channel = ctx.member?.voice.channel;
    if (!channel) return ctx.channel.send('You\'re not in a voice channel.');

    const track = await player.queue.addToFirst(ctx.args[0]);

    if (typeof track === 'boolean') return ctx.channel.send('Can\t find that.');

    player.joinVoice(channel);

    ctx.channel.send(`"**${track.getTitle()}** is added to the queue!`);

    player.playNext();
  }
}