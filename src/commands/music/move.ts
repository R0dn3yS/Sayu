import { Command, CommandContext } from '../../../deps.ts';
import { player } from '../../index.ts';

export default class MoveCommand extends Command {
  override name = 'move';
  override category = 'music';
  override description = 'Moves music';

  override execute(ctx: CommandContext) {
    const channel = ctx.member?.voice.channel;
    if (!channel) return ctx.channel.send('You\'re not in a voice channel.');

    try {
      player.queue.move(ctx.args[0], ctx.args[1]);
      ctx.channel.send(`Moved song from position ${ctx.args[0]} to position ${ctx.args[1]}`);
    // deno-lint-ignore no-explicit-any
    } catch (e: any) {
      ctx.channel.send(e.message);
    }
  }
}