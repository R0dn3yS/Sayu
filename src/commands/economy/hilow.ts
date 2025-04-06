import { Message } from "discord.js";
import { Command, CommandContext } from '../../../deps.ts';
import { db } from '../../index.ts';

export default class HilowCommand extends Command {
  override name = 'hilow';
  override category = 'economy';
  override description = 'Shows wallet balance';

  override execute(ctx: CommandContext) {
    const cost = 5;
    const win = 7;
    const exact = 15;

    // deno-lint-ignore no-explicit-any
    const user: any[] = db.prepare('SELECT * FROM wallets WHERE id = ?').all(ctx.author.id);

    db.prepare('UPDATE wallets SET money = ? WHERE id = ?').run(user[0].money - cost, ctx.author.id);

    const initial = Math.floor(Math.random() * 10) + 1;
    const target = Math.floor(Math.random() * 10) + 1;

    ctx.channel.send(`Number is ${initial}, type "higher", "lower" or "exact" to guess.`);

    const filter = (m: Message) => m.author.id === ctx.author.id && ['higher', 'lower', 'exact'].includes(m.content);
    const game = ctx.channel.createMessageCollector({ filter, time: 15000 });

    game.once('collect', m => {
      switch (m.content) {
        case 'higher': {
          if (target > initial) {
            ctx.channel.send(`You won, your balance is now \`${user[0].money - cost + win}\``);
            db.prepare('UPDATE wallets SET money = ? WHERE id = ?').run(user[0].money - cost + win, ctx.author.id);
          } else {
            ctx.channel.send(`You lost, your balance is now \`${user[0].money - cost}\``);
          }

          break;
        }

        case 'lower': {
          if (target < initial) {
            ctx.channel.send(`You won, your balance is now \`${user[0].money - cost + win}\``);
            db.prepare('UPDATE wallets SET money = ? WHERE id = ?').run(user[0].money - cost + win, ctx.author.id);
          } else {
            ctx.channel.send(`You lost, your balance is now \`${user[0].money - cost}\``);
          }

          break;
        }

        case 'exact': {
          if (target === initial) {
            ctx.channel.send(`You won, your balance is now \`${user[0].money - cost + exact}\``);
            db.prepare('UPDATE wallets SET money = ? WHERE id = ?').run(user[0].money - cost + exact, ctx.author.id);
          } else {
            ctx.channel.send(`You lost, your balance is now \`${user[0].money - cost}\``);
          }

          break;
        }
      }
    });
  }
}