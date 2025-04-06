import { Command, CommandContext } from '../../../deps.ts';
import { db } from '../../index.ts';

export default class AddCommand extends Command {
  override name = 'add';
  override category = 'economy';
  override description = 'Adds money to balance';
  override ownerOnly = true;

  override execute(ctx: CommandContext) {
    const amount = parseInt(ctx.args[0]);
    const user = ctx.message.mentions.users.first() ?? ctx.author;

    // deno-lint-ignore no-explicit-any
    const result: any[] = db.prepare('SELECT * FROM wallets WHERE id = ?').all(user.id);
    db.prepare('UPDATE wallets SET money = ? WHERE id = ?').run(amount + result[0].money, user.id);

    ctx.channel.send(`Added \`${amount}\` to ${user}'s balance, their balance is now: \`${result[0].money + amount}\``);
  }
}