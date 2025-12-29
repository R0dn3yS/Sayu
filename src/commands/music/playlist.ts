import { Command, CommandContext } from '../../../deps.ts';
import { player } from '../../index.ts';

export default class PlaylistCommand extends Command {
  override name = 'playlist';
  override category = 'music';
  override description = 'Plays playlist';

  override async execute(ctx: CommandContext) {
    const channel = ctx.member?.voice.channel;
    if (!channel) return ctx.channel.send('You\'re not in a voice channel.');

    const playlist = await player.queue.addPlaylist(ctx.args[0], player, channel);

    if (typeof playlist === 'boolean') return ctx.channel.send('Can\'t find that.');

    ctx.channel.send(`Playlist: "**${playlist}**" has been added to the queue!`);
  }
}