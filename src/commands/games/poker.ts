import { Message, MessageReaction, User } from 'discord.js';
import { Command, CommandContext } from '../../../deps.ts';
import { shuffle } from '../../utils/delay.ts';
import { db } from "../../index.ts";

export default class TictactoeCommand extends Command {
  override name = 'poker';
  override category = 'games';
  override description = 'Play a game of poker with another player';

  override async execute(ctx: CommandContext) {
    const suits = 'SDHC';
    const cards = [ '2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A' ];
    const cardValues = [ 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14 ];
    let deck: string[] = [];

    const playerOne = ctx.author;
    let playerTwo: User;

    for (const suit of suits) {
      for (const card of cards) {
        deck.push(`${card}${suit}`);
      }
    }

    deck = shuffle(deck);

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
      const done = [ false, false ];

      const p1Cards = [ deck.pop(), deck.pop(), deck.pop(), deck.pop(), deck.pop() ];
      const p2Cards = [ deck.pop(), deck.pop(), deck.pop(), deck.pop(), deck.pop() ];

      await playerOne.createDM();
      await playerTwo.createDM();

      playerOne.dmChannel?.send(`Card 1: ${p1Cards[0]}\nCard 2: ${p1Cards[1]}\nCard 3: ${p1Cards[2]}\nCard 4: ${p1Cards[3]}\nCard 5: ${p1Cards[4]}\n-----`);
      playerTwo.dmChannel?.send(`Card 1: ${p2Cards[0]}\nCard 2: ${p2Cards[1]}\nCard 3: ${p2Cards[2]}\nCard 4: ${p2Cards[3]}\nCard 5: ${p2Cards[4]}\n-----`);

      const p1Filter = (m: Message) => reactionFilter(m, playerOne);
      const p2Filter = (m: Message) => reactionFilter(m, playerTwo);

      const p1Collector = ctx.channel.createMessageCollector({ filter: p1Filter, time: 300000 });
      const p2Collector = ctx.channel.createMessageCollector({ filter: p2Filter, time: 300000 });

      p1Collector.on('collect', async m => {
        try {
          await m.delete();
        } catch (err) {
          console.log(err);
        }

        if (m.content !== 'keep') {
          const cardsToRemove: string[] = [];

          for (const n of m.content.split(' ')) {
            const num = parseInt(n) - 1;

            cardsToRemove.push(p1Cards[num] ?? '');
          }

          for (const card of cardsToRemove) {
            const index = p1Cards.indexOf(card);
            p1Cards.splice(index, 1);
          }

          for(let i = p1Cards.length; i < 5; i++) {
            p1Cards.push(deck.pop());
          }

          playerOne.dmChannel?.send(`Card 1: ${p1Cards[0]}\nCard 2: ${p1Cards[1]}\nCard 3: ${p1Cards[2]}\nCard 4: ${p1Cards[3]}\nCard 5: ${p1Cards[4]}\n-----`);
        }

        done[0] = true;
        p1Collector.stop();
        handleGameWin(done, p1Cards, p2Cards);
      });

      p2Collector.on('collect', async m => {
        try {
          await m.delete();
        } catch (err) {
          console.log(err);
        }

        if (m.content !== 'keep') {
          const cardsToRemove: string[] = [];

          for (const n of m.content.split(' ')) {
            const num = parseInt(n) - 1;

            cardsToRemove.push(p2Cards[num] ?? '');
          }

          for (const card of cardsToRemove) {
            const index = p2Cards.indexOf(card);
            p2Cards.splice(index, 1);
          }

          for(let i = p2Cards.length; i < 5; i++) {
            p2Cards.push(deck.pop());
          }

          playerTwo.dmChannel?.send(`Card 1: ${p2Cards[0]}\nCard 2: ${p2Cards[1]}\nCard 3: ${p2Cards[2]}\nCard 4: ${p2Cards[3]}\nCard 5: ${p2Cards[4]}\n-----`);
        }

        done[1] = true;
        p2Collector.stop();
        handleGameWin(done, p1Cards, p2Cards);
      });
    });

    function reactionFilter(m: Message, player: User): boolean {
      let valid = true;

      if (m.content.split(' ').length > 5) valid = false;

      for (const num of m.content.split(' ')) {
        if (parseInt(num).toString() !== num) valid = false;
        if (num.length !== 1) valid = false;
      }

      if (m.content === 'keep') valid = true;

      if (m.author.id !== player.id) valid = false;

      return valid;
    }

    function handleGameWin(done: boolean[], p1Cards: (string|undefined)[], p2Cards: (string|undefined)[]) {
      if (!done[0] || !done[1]) return;
      
      ctx.channel.send(`${playerOne}'s cards are: ${p1Cards.join(', ')}`);
      ctx.channel.send(`${playerTwo}'s cards are: ${p2Cards.join(', ')}`);

      if (handCheck(p1Cards) > handCheck(p2Cards)) {
        ctx.channel.send(`${playerOne} has won!`);

        const result = db.prepare('SELECT * FROM wallets WHERE id = ?').get(playerOne.id) as { id: string, money: number };
        db.prepare('UPDATE wallets SET money = ? WHERE id = ?').run(5 + result.money, playerOne.id);
      } else if (handCheck(p2Cards) > handCheck(p1Cards)) {
        ctx.channel.send(`${playerTwo} has won!`);

        const result = db.prepare('SELECT * FROM wallets WHERE id = ?').get(playerTwo.id) as { id: string, money: number };
        db.prepare('UPDATE wallets SET money = ? WHERE id = ?').run(5 + result.money, playerTwo.id);
      } else {
        ctx.channel.send('I can\'t handle draws uhh');
      }
    }

    function handCheck(deck: (string|undefined)[]): number {
      if (hasRoyalFlush(deck)) {
        return 10;
      } else if (hasStraightFlush(deck)) {
        return 9;
      } else if (hasFourKind(deck)) {
        return 8;
      } else if (hasFullHouse(deck)) {
        return 7;
      } else if (hasFlush(deck)) {
        return 6;
      } else if (hasStraight(deck)) {
        return 5;
      } else if (hasThreeKind(deck)) {
        return 4;
      } else if (hasTwoPair(deck)) {
        return 3;
      } else if (hasPair(deck)) {
        return 2;
      } else {
        return 1;
      }
    }

    function hasRoyalFlush(deck: (string|undefined)[]): boolean {
      const deckValues = [];

      for (const card of deck) {
        const c = card!.split('')[0];
        deckValues.push(cardValues[cards.indexOf(c)]);
      }

      return hasStraightFlush(deck) && deckValues[0] === 10;
    }

    function hasStraightFlush(deck: (string|undefined)[]): boolean {
      return hasFlush(deck) && hasStraight(deck);
    }

    function hasFourKind(deck: (string|undefined)[]): boolean {
      const deckValues = [];
      const counts: Record<number, number> = {};

      for (const card of deck) {
        const c = card!.split('')[0];
        deckValues.push(cardValues[cards.indexOf(c)]);
      }

      deckValues.forEach((el) => {
        counts[el] = counts[el] ? (counts[el] + 1) : 1;
      });

      const countsSorted = Object.entries(counts).sort(([_, a], [__, b]) => b - a);
      return countsSorted[0][1] >= 4;
    }

    function hasFullHouse(deck: (string|undefined)[]): boolean {
      const deckValues = [];
      const counts: Record<number, number> = {};

      for (const card of deck) {
        const c = card!.split('')[0];
        deckValues.push(cardValues[cards.indexOf(c)]);
      }

      deckValues.forEach((el) => {
        counts[el] = counts[el] ? (counts[el] + 1) : 1;
      });

      const countsSorted = Object.entries(counts).sort(([_, a], [__, b]) => b - a);
      return countsSorted[0][1] === 3 && countsSorted[1][1] === 2;
    }

    function hasFlush(deck: (string|undefined)[]): boolean {
      const suits = new Set();

      for (const card of deck) {
        const suit = card?.split('')[1];
        suits.add(suit);
      }

      return suits.size === 1;
    }

    function hasStraight(deck: (string|undefined)[]): boolean {
      const deckValues = [];

      for (const card of deck) {
        const c = card!.split('')[0];
        deckValues.push(cardValues[cards.indexOf(c)]);
      }

      deckValues.sort((a, b) => a - b);

      const initial = deckValues[0]
      return deckValues[1] === initial + 1 && deckValues[2] === initial + 2 && deckValues[3] === initial + 3 && deckValues[4] === initial + 4;
    }

    function hasThreeKind(deck: (string|undefined)[]): boolean {
      const deckValues = [];
      const counts: Record<number, number> = {};

      for (const card of deck) {
        const c = card!.split('')[0];
        deckValues.push(cardValues[cards.indexOf(c)]);
      }

      deckValues.forEach((el) => {
        counts[el] = counts[el] ? (counts[el] + 1) : 1;
      });

      const countsSorted = Object.entries(counts).sort(([_, a], [__, b]) => b - a);
      return countsSorted[0][1] >= 3;
    }

    function hasTwoPair(deck: (string|undefined)[]): boolean {
      const deckValues = [];
      const counts: Record<number, number> = {};

      for (const card of deck) {
        const c = card!.split('')[0];
        deckValues.push(cardValues[cards.indexOf(c)]);
      }

      deckValues.forEach((el) => {
        counts[el] = counts[el] ? (counts[el] + 1) : 1;
      });

      const countsSorted = Object.entries(counts).sort(([_, a], [__, b]) => b - a);
      return countsSorted[0][1] >= 2 && countsSorted[1][1] >= 2;
    }

    function hasPair(deck: (string|undefined)[]): boolean {
      const deckValues = [];
      const counts: Record<number, number> = {};

      for (const card of deck) {
        const c = card!.split('')[0];
        deckValues.push(cardValues[cards.indexOf(c)]);
      }

      deckValues.forEach((el) => {
        counts[el] = counts[el] ? (counts[el] + 1) : 1;
      });

      const countsSorted = Object.entries(counts).sort(([_, a], [__, b]) => b - a);
      return countsSorted[0][1] >= 2;
    }
  }
}