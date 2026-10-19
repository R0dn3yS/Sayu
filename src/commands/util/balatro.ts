
import { FuzzySearch } from '@ys319/fuzzy-search';
import { Command, CommandContext } from '../../../deps.ts';

interface Description {
  name: string;
  description: string;
}

function getDescription(arr: Description[], searchString: string): string | void {
  const search = new FuzzySearch<Description>({ keys: [ 'name' ] });
  search.addAll(arr);

  const result = search.search(searchString);

  if (result.length === 0) {
    return;
  } else {
    return result[0].item.description;
  }
}

export default class BalatroCommand extends Command {
  override name = 'balatro';
  override category = 'util';
  override description = 'Gets information about Balatro';
  
  override execute(ctx: CommandContext) {
    const searchType = ctx.args[0].toLowerCase();
    let searchString = ctx.args.splice(1, 1).join(' ');

    if (ctx.args.length !== 1) {
      searchString = searchString.replaceAll('joker', '').trim();
    }

    switch (searchType) {
      case 'jokers':
      case 'joker': {
        const jokers: Description[] = JSON.parse(Deno.readTextFileSync(`${Deno.cwd()}/balatro.json`));

        const description = getDescription(jokers, searchString);
        if (description) ctx.channel.send(description);
      }
    }
  }
}