import { Command, CommandContext } from '../../../deps.ts';

export default class ArchCommand extends Command {
  override name = 'arch';
  override category = 'util';
  override description = 'Search Arch wiki';

  override async execute(ctx: CommandContext) {
    return ctx.channel.send(await fetch(`https://wiki.archlinux.org/index.php?search=${ctx.args.join('+')}`).then(res => res.url));
  }
}