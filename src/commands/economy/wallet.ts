import { Command, CommandContext } from '../../../deps.ts';
import { db } from '../../index.ts';

export default class WalletCommand extends Command {
  override name = 'wallet';
  override category = 'economy';
  override description = 'Shows wallet balance';

  override execute(ctx: CommandContext) {
    const user = ctx.message.mentions.users.first() ?? ctx.author;

    // deno-lint-ignore no-explicit-any
    const result: any[] = db.prepare('SELECT * FROM wallets WHERE id = ?').all(user.id);

    ctx.channel.send(`${user}'s balance is: \`${result[0].money}\``);
  }
}