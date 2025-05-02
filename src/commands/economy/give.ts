import { Command, CommandContext } from '../../../deps.ts';
import { db } from '../../index.ts';
import { delay } from '../../utils/delay.ts';

export default class GiveCommand extends Command {
  override name = 'give';
  override category = 'economy';
  override description = 'Give money to another user';

  override async execute(ctx: CommandContext) {
    const amount = parseInt(ctx.args[0]);
    const user = ctx.message.mentions.users.first() ?? undefined;

    if (user === undefined) return ctx.message.reply(`Please specify a user to give money to`);
    if (Number.isNaN(amount)) return ctx.channel.send('That\'s not a valid amount.');

    // deno-lint-ignore no-explicit-any
    const userMoney: any[] = db.prepare('SELECT * FROM wallets WHERE id = ?').all(user.id);
    // deno-lint-ignore no-explicit-any
    const authorMoney: any[] = db.prepare('SELECT * FROM wallets WHERE id = ?').all(ctx.author.id);

    if (authorMoney[0].money < amount) return ctx.channel.send('You do not have enough money.');

    db.prepare('UPDATE wallets SET money = ? WHERE id = ?').run(userMoney[0].money + amount, user.id);
    await delay(200);
    db.prepare('UPDATE wallets SET money = ? WHERE id = ?').run(authorMoney[0].money - amount, ctx.author.id);

    ctx.channel.send(`Gave \`${amount}\` to ${user}`);
  }
}