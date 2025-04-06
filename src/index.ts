import { ActivityType, EmbedBuilder, GatewayIntentBits, TextChannel, VoiceBasedChannel } from 'discord.js';
import { AudioPlayerStatus } from '@discordjs/voice';
import { config } from 'dotenv';
import { stripIndents } from 'common-tags';
import { DatabaseSync } from 'node:sqlite';
import { CommandClient, Player } from '../deps.ts'

import { delay } from './utils/delay.ts';

config();

let memberCount: number;
let countChannel: VoiceBasedChannel;

const client = new CommandClient({
  prefix: Deno.env.get('PREFIX') ?? '\\',
  owners: [ '325254775828512778', '125930667795152896' ],
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
  ]
});

client.commands.loader.loadDirectory('./src/commands', {
  maxDepth: 2,
});

export const player = new Player(client);
export const db = new DatabaseSync(Deno.env.get('DB_PATH') ?? './sayu.db');

client.once('ready', () => {
  console.log(`${client.user?.username} is ready on ${client.guilds.cache.size} servers.`);

  client.user?.setPresence({
    activities: [{
      name: 'over you',
      type: ActivityType.Watching
    }],
  });

  countChannel = client.channels.resolve('947819208518008874') as VoiceBasedChannel;
  memberCount = countChannel.guild.memberCount;
  countChannel.edit({ name: `Members: ${memberCount}` });
});

client.once('ready', async () => {
  db.exec('CREATE TABLE IF NOT EXISTS wallets (id TEXT PRIMARY KEY, money INTEGER)');

  // deno-lint-ignore no-explicit-any
  const result: any[] = db.prepare('SELECT id FROM wallets').all();

  const list = await client.guilds.cache.get('486410117961744384')?.members.fetch() ?? [];

  for (const member of list) {
    if (member[1].user.bot) continue;
    let inList = false;

    for (const entry of result) {
      if (entry.id === member[0]) {
        inList = true;
      }
    }

    if (inList) continue;

    db.prepare('INSERT INTO wallets (id, money) VALUES (?, ?)').run(member[0], 100);
  }
});

client.on('messageCreate', async message => {
  if (message.author.bot) return;

  const channel = message.channel as TextChannel;

  if (channel.name === 'quotes') {
    const year = new Date().getFullYear().toString().substring(2);
    const QUOTE_REGEX = new RegExp(`"(.+)" - <@!?(\\d{17,19})> 2k${year}`);

    if (!QUOTE_REGEX.test(message.content)) {
      message.delete();
      const reply = await message.channel.send('This message is not a quote.');
      await delay(2500);
      reply.delete();
    }
  }

  return;
});

client.on('messageCreate', message => {
  if (message.author.bot) return;

  if (message.author.id === '268401778251268137') {
    if (Math.ceil(Math.random() * 50) === 1) {
      message.channel.send(`"${message.content}" <:dubbie:1244615364457926777>`);
    }

    if (message.content.includes('er zit een man') || message.content.includes('er zit iemand')) {
      message.channel.send('Dubbie er zit niemand.');
    }
  }

  if (message.content.toLowerCase().replace('\*\*', '').includes('enigste')) {
    message.reply('Enige*');
  }
});

client.on('messageDelete', (message) => {
  const channel = message.channel as TextChannel;

  if (channel.name === 'quotes' || channel.name === 'bot-spam') return;
  if (message.content!.length > 1000) return;

  const dLog = message.guild?.channels.resolve('790787179663196191') as TextChannel;

  const dEmbed = new EmbedBuilder()
    .setTitle('Deleted Message')
    .setThumbnail(message.author?.displayAvatarURL() ?? '')
    .setFooter({ text: client.user?.username ?? '', iconURL: client.user?.displayAvatarURL() })
    .setColor(0xFF0000)
    .setDescription(stripIndents`**> User** ${message.author}
      **> Deleted in:** ${message.channel}
      **> Message:** ${message.content}`)
    .setTimestamp();

  return dLog.send({ embeds: [ dEmbed ]});
});

client.on('messageUpdate', (oldMessage, newMessage) => {
  const channel = oldMessage.channel as TextChannel;

  if (channel.name === 'bot-spam') return;

  if (oldMessage.content === newMessage.content) return;
  if (oldMessage.content!.length + newMessage.content!.length > 1000) return;

  const eLog = oldMessage.guild?.channels.resolve('790792385889566751') as TextChannel;

  const eEmbed = new EmbedBuilder()
    .setTitle('Edited Message')
    .setThumbnail(oldMessage.author?.displayAvatarURL() ?? '')
    .setFooter({ text: client.user?.username ?? '', iconURL: client.user?.displayAvatarURL() })
    .setColor(0xFFA500)
    .setDescription(stripIndents`**> User** ${oldMessage.author}
      **> Edited in:** ${channel}
      **> Old message:** ${oldMessage.content}
      **> New message:** ${newMessage.content}`)
    .setTimestamp();

  return eLog.send({ embeds: [ eEmbed ]});
});

client.on('guildMemberAdd', (member) => {
  memberCount += 1;
  countChannel.edit({ name: `Members: ${memberCount}` });

  member.roles.add('789192241087512687');
});

client.on('guildMemberRemove', (_member) => {
  memberCount -= 1;
  countChannel.edit({ name: `Members: ${memberCount}` });
});

player.audioPlayer.on(AudioPlayerStatus.Idle, async () => {
  if (player.queue.get().length === 1) {
    player.queue.clear();
    player.dcOnTimeout = true;
    await delay(30000);

    if (player.dcOnTimeout) player.disconnectVoice();
  } else {
    player.nextInQueue();
  }
});

client.login(Deno.env.get('DISCORD_TOKEN'));