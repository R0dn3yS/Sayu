import { Command, CommandContext } from '../../../deps.ts';
import { player } from '../../index.ts';

export default class PauseCommand extends Command {
  override name = 'pause';
  override category = 'music';
  override description = 'Pauses music';

  override execute(ctx: CommandContext) {
    const channel = ctx.member?.voice.channel;
    if (!channel) return ctx.channel.send('You\'re not in a voice channel.');

    player.pause();
  }
}