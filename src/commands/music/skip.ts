import { Command, CommandContext } from '../../../deps.ts';
import { player } from '../../index.ts';

export default class SkipCommand extends Command {
  override name = 'skip';
  override category = 'music';
  override description = 'Skips music';

  override execute(ctx: CommandContext) {
    const channel = ctx.member?.voice.channel;
    if (!channel) return ctx.channel.send('You\'re not in a voice channel.');

    player.nextInQueue();
  }
}