import { Message } from "discord.js";
import { Command, CommandContext } from '../../../deps.ts';
import { db } from '../../index.ts';

export default class HilowCommand extends Command {
  override name = 'hilow';
  override category = 'economy';
  override description = 'Shows wallet balance';

  override execute(ctx: CommandContext) {
    const betAmount = parseInt(ctx.args[0]);
    // deno-lint-ignore no-explicit-any
    const user: any[] = db.prepare('SELECT * FROM wallets WHERE id = ?').all(ctx.author.id);

    if (Number.isNaN(betAmount) || betAmount < 5) return ctx.channel.send('That\'s not a valid bet amount.');
    if (user[0].money < betAmount) return ctx.channel.send('You do not have anough money.');

    const win = Math.floor(betAmount * 1.5);
    const exact = betAmount * 3;

    db.prepare('UPDATE wallets SET money = ? WHERE id = ?').run(user[0].money - betAmount, ctx.author.id);

    const initial = Math.floor(Math.random() * 10) + 1;
    const target = Math.floor(Math.random() * 10) + 1;

    ctx.channel.send(`Number is ${initial}, type "higher", "lower" or "exact" to guess.`);

    const filter = (m: Message) => m.author.id === ctx.author.id && ['higher', 'lower', 'exact'].includes(m.content);
    const game = ctx.channel.createMessageCollector({ filter, time: 15000 });

    game.once('collect', m => {
      switch (m.content) {
        case 'higher': {
          if (target > initial) {
            gameWin(win);
          } else {
            gameLoss();
          }

          break;
        }

        case 'lower': {
          if (target < initial) {
            gameWin(win);
          } else {
            gameLoss();
          }

          break;
        }

        case 'exact': {
          if (target === initial) {
            gameWin(exact);
          } else {
            gameLoss();
          }

          break;
        }
      }
    });

    function gameWin(winAmount: number) {
      ctx.channel.send(`The number was: \`${target}\`\n\nYou won \`${win}\`, your balance is now \`${user[0].money - betAmount + winAmount}\``);
      db.prepare('UPDATE wallets SET money = ? WHERE id = ?').run(user[0].money - betAmount + winAmount, ctx.author.id);
    }

    function gameLoss() {
      ctx.channel.send(`The number was: \`${target}\`\n\nYou lost \`${betAmount}\`, your balance is now \`${user[0].money - betAmount}\``);
    }
  }
}