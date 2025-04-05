import { Command, CommandContext } from '../../../deps.ts';

export default class ServerpicCommand extends Command {
  override name = 'serverpic';
  override category = 'util';
  override description = 'Returns the server picture';

  override execute(ctx: CommandContext) {
    ctx.channel.send(ctx.guild!.iconURL() ?? '')
  }
}