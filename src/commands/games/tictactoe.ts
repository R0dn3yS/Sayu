import { Message, MessageReaction, User } from 'discord.js';
import { Command, CommandContext } from '../../../deps.ts';
import { delay } from '../../utils/delay.ts';

export default class TictactoeCommand extends Command {
  override name = 'tictactoe';
  override category = 'games';
  override description = 'Play a game of Tic Tac Toe with another player';

  override async execute(ctx: CommandContext) {
    const playerOne = ctx.author;
    let playerTwo: User;
    let turn = 0;

    const rMessage = await ctx.channel.send(`${playerOne} registered as Player One, react with ❌ to register as Player Two.`);
    rMessage.react('❌');

    const filter = (reaction: MessageReaction, user: User) => reaction.emoji.name === '❌' && user.id !== playerOne.id && !user.bot;
    const playerCollector = rMessage.createReactionCollector({ filter, time: 15000 });

    playerCollector.on('collect', (_reaction, user) => {
      playerTwo = user;
      ctx.channel.send(`${playerTwo} registered as Player Two.`);
      playerCollector.stop();
    });

    playerCollector.on('end', async _reactions => {
      if (playerTwo === undefined) return ctx.channel.send('No second player registered.');

      let currentPlayer = Math.floor(Math.random() * 2) === 0 ? playerOne : playerTwo;

      ctx.channel.send(`${currentPlayer}'s turn, type 1-9 to select a square.`);
      const board: string[][] = [
        [ '⬜', '⬜', '⬜' ],
        [ '⬜', '⬜', '⬜' ],
        [ '⬜', '⬜', '⬜' ]
      ];

      const boardMessage = await ctx.channel.send('⬜⬜⬜\n⬜⬜⬜\n⬜⬜⬜');

      const filter = (m: Message) => m.author.id === currentPlayer.id && m.content.length === 1 && parseInt(m.content).toString() === m.content && m.content !== '0';
      const gameCollector = ctx.channel.createMessageCollector({ filter, time: 300000 });

      gameCollector.on('collect', m => {
        m.delete();

        const coords = [Math.ceil(parseInt(m.content) / 3) - 1, ((parseInt(m.content) - 1) % 3)];
        const cur = currentPlayer === playerOne ? '❌' : '⭕';
  
        if (board[coords[0]][coords[1]] !== '⬜') return ctx.channel.send('Square already filled').then(async r => {
          await delay(2500);
          r.delete();
        });
        
        board[coords[0]][coords[1]] = cur;

        boardMessage.edit(`${board[0][0]}${board[0][1]}${board[0][2]}\n${board[1][0]}${board[1][1]}${board[1][2]}\n${board[2][0]}${board[2][1]}${board[2][2]}`);

        for (let y = 0; y < 3; y++) {
          let rowWin = true;
          let colWin = true;

          for (let x = 0; x < 3; x++) {
            if (board[y][x] !== cur) rowWin = false;
            if (board[x][y] !== cur) colWin = false;
          }

          if (rowWin || colWin) winner();
        }

        let diagWinTLR = true;
        let diagWinTRL = true;

        for (let i = 0; i < 3; i++) {
          if (board[i][i] !== cur) diagWinTLR = false;
          if (board[i][2 - 1] !== cur) diagWinTRL = false;
        }

        if (diagWinTLR || diagWinTRL) winner();

        function winner() {
          ctx.channel.send(`${currentPlayer} has won!`);
          playerCollector.stop();
        }

        currentPlayer = currentPlayer === playerOne ? playerTwo : playerOne;
        turn++;

        if (turn === 9) {
          ctx.channel.send(`It's a draw.`);
          playerCollector.stop();
        }
      });
    });
  }
}