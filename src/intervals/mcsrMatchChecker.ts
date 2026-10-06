import { McsrClient } from '@r0dn3ys/mcsr-api';
import { stripIndents } from 'common-tags';
import { EmbedBuilder, TextChannel } from 'discord.js';
import { miliToMinutes } from '../utils/time.ts';

export async function checkMcsrMatches(mcsrClient: McsrClient, channel: TextChannel, players: string[]) {
  const matchIDs: number[] = [];

  for (const player of players) {
    const currentTimestamp = Math.floor(Temporal.Now.instant().epochMilliseconds / 1000);
    const matchData = (await mcsrClient.getUserMatches(player, { sort: 'newest' }))[0];
    
    if (matchIDs.includes(matchData.id)) continue;

    if (matchData.date >= currentTimestamp - 30 && matchData.forfeited !== true) {
      const winnerUuid = matchData.result.uuid;
      const winner = matchData.players[0].uuid === winnerUuid ? matchData.players[0] : matchData.players[1];

      const matchEmbed = new EmbedBuilder()
        .setTitle(`${matchData.players[0].nickname} vs ${matchData.players[1].nickname}`)
        .setThumbnail(`https://api.mcheads.org/head/${winner.nickname}/256`)
        .setColor(0x6BA52A)
        .setDescription(stripIndents`**Winner:** ${winner.nickname}
          **Time:** ${miliToMinutes(matchData.result.time)}
          **Seed type:** ${matchData.seed?.overworld}
          **Nether:** ${matchData.seed?.nether}
          \n[Match Url](https://mcsrranked.com/stats/${player}/${matchData.id})`)
        .setTimestamp(matchData.date * 1000);

      matchIDs.push(matchData.id)
      channel.send({ embeds: [ matchEmbed ] });
    }
  }
}