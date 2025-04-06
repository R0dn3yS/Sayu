import { Command, CommandContext } from '../../../deps.ts';
import { db } from '../../index.ts';

export default class SetCommand extends Command {
  override name = 'set';
  override category = 'economy';
  override description = 'Adds money to balance';
  override ownerOnly = true;

  override execute(ctx: CommandContext) {
    const amount = parseInt(ctx.args[0]);
    const user = ctx.message.mentions.users.first() ?? ctx.author;

    db.prepare('UPDATE wallets SET money = ? WHERE id = ?').run(amount, user.id);

    ctx.channel.send(`Set ${user}'s balance to: \`${amount}\``);
  }
}