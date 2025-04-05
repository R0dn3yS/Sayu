import { Command, CommandContext } from '../../../deps.ts';

export default class UserpicCommand extends Command {
  override name = 'userpic';
  override category = 'util';
  override description = 'Returns the users picture';

  override execute(ctx: CommandContext) {
    let user;

    if (ctx.args[0]) {
      user = ctx.message.mentions.users.first();
    } else {
      user = ctx.author;
    }

    ctx.channel.send(user?.displayAvatarURL() ?? '');
  }
}