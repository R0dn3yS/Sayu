import { Command, CommandContext } from '../../../deps.ts';
import { db } from '../../index.ts';

export default class WalletCommand extends Command {
  override name = 'wallet';
  override category = 'economy';
  override description = 'Shows wallet balance';

  override execute(ctx: CommandContext) {
    const user = ctx.message.mentions.users.first() ?? ctx.author;

    const result = db.prepare('SELECT * FROM wallets WHERE id = ?').get(user.id) as { id: string, money: number };

    ctx.channel.send(`${user}'s balance is: \`${result.money}\``);
  }
}