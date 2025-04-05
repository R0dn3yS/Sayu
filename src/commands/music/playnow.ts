import { Command, CommandContext } from '../../../deps.ts';
import { player } from '../../index.ts';

export default class PlaynowCommand extends Command {
  override name = 'playnow';
  override category = 'music';
  override description = 'Plays music now';

  override async execute(ctx: CommandContext) {
    const channel = ctx.member?.voice.channel;
    if (!channel) return ctx.channel.send('You\'re not in a voice channel.');

    const track = await player.queue.addToFirst(ctx.args[0]);

    if (typeof track === 'boolean') return ctx.channel.send('Can\'t find that.');

    player.joinVoice(channel);

    ctx.channel.send(`"**${track.getTitle()}** is added to the queue!`);

    player.nextInQueue();
  }
}