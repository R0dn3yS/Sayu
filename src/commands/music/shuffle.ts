import { Command, CommandContext } from '../../../deps.ts';
import { player } from '../../index.ts';

export default class ShuffleCommand extends Command {
  override name = 'shuffle';
  override category = 'music';
  override description = 'Shuffles the queue';

  override execute(ctx: CommandContext) {
    const channel = ctx.member?.voice.channel;
    if (!channel) return ctx.channel.send('You\'re not in a voice channel.');

    const res = player.queue.shuffle();

    if (res) {
      ctx.channel.send('Queue has been shuffled.');
    } else {
      ctx.channel.send('There is no queue.');
    }
  }
}