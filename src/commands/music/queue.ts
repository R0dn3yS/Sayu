import { Command, CommandContext } from '../../../deps.ts';
import { player } from '../../index.ts';

export default class QueueCommand extends Command {
  override name = 'queue';
  override category = 'music';
  override description = 'Lists music queue';

  override execute(ctx: CommandContext) {
    const channel = ctx.member?.voice.channel;
    if (!channel) return ctx.channel.send('You\'re not in a voice channel.');

    let msg = '';

    for (let i = 1; i < player.queue.get().length; i++) {
      msg += `${i}. ${player.queue.get()[i].getTitle()}\n`;
    }

    ctx.channel.send(msg === '' ? 'Queue is empty.' : msg);
  }
}