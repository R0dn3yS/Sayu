import { Command, CommandContext } from '../../../deps.ts';
import { player } from '../../index.ts';
import { progressBar } from "../../utils/bar.ts";

export default class Nowplayingcommand extends Command {
  override name = 'nowplaying';
  override category = 'music';
  override description = 'Shuffles the queue';

  override execute(ctx: CommandContext) {
    const channel = ctx.member?.voice.channel;
    if (!channel) return ctx.channel.send('You\'re not in a voice channel.');

    const info = player.nowPlaying();

    if (typeof info !== 'boolean') {
      const durMinutes = Math.floor(info.duration / 60);
      const durSeconds = info.duration % 60;
      const durFull = `${durMinutes < 10 ? '0' + durMinutes.toString() : durMinutes.toString()}:${durSeconds < 10 ? '0' + durSeconds.toString() : durSeconds.toString()}`;

      const atMinutes = Math.floor(info.at / 60);
      const atSeconds = info.at % 60;
      const atFull = `${atMinutes < 10 ? '0' + atMinutes.toString() : atMinutes.toString()}:${atSeconds < 10 ? '0' + atSeconds.toString() : atSeconds.toString()}`;

      const bar = progressBar(info.at, info.duration, 20);
        
      ctx.channel.send('```' + `${info.name}\n${bar}\n${atFull}/${durFull}` + '```');
    } else {
      ctx.channel.send('Nothing is playing.');
    }
  }
}