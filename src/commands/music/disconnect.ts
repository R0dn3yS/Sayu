import { Command, CommandContext } from '../../../deps.ts';
import { player } from '../../index.ts';

export default class DisconnectCommand extends Command {
  override name = 'disconnect';
  override category = 'music';
  override description = 'Disconnects bot from VC';

  override execute(_ctx: CommandContext) {
    player.disconnectVoice();
  }
}