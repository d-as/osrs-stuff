import { useState } from 'react';
import './App.scss';

const { VITE_API_USER_AGENT } = import.meta.env;

const OSRS_WIKI_API_URL = 'https://oldschool.runescape.wiki/api.php';

enum Item {
  ELDER_MAUL = 'Elder maul',
  KODAI_INSIGNIA = 'Kodai insignia',
  TWISTED_BOW = 'Twisted bow',
}

const OSRS_WIKI_PAGE_IDS: Record<Item, number> = {
  [Item.ELDER_MAUL]: 78623,
  [Item.KODAI_INSIGNIA]: 83304,
  [Item.TWISTED_BOW]: 82459,
};

const PAGE_TITLES = Object.values(Item)
  .map(item => `File: ${item}.png`)
  .sort((a, b) => a.localeCompare(b));

interface OSRSWikiImageInfo {
  descriptionshorturl: string
  descriptionurl: string
  url: string
}

interface OSRSWikiImagePage {
  imageinfo: OSRSWikiImageInfo[]
  imagerepository: string
  ns: number
  pageid: number
  title: string
}

interface OSRSWikiImageResponse {
  continue: {
    iistart: string
    continue: string
  }
  query: {
    pages: Record<number, OSRSWikiImagePage>
  }
}

const increment = (value: number): number => value + 1;

export const App = () => {
  const [count, setCount] = useState(0);
  const [isCooldown, setIsCooldown] = useState(false);
  const [items, setItems] = useState<OSRSWikiImagePage[]>([]);

  const fetchData = (): Promise<OSRSWikiImageResponse> => (
    new Promise((resolve, reject) => {
      fetch(`${
        OSRS_WIKI_API_URL
      }?action=query&titles=${PAGE_TITLES.join('|')}&maxlag=5&format=json&prop=imageinfo&iiprop=url&origin=*`, {
        method: 'GET',
        headers: {
          'Accept-Encoding': 'gzip',
          'Api-User-Agent': VITE_API_USER_AGENT,
        },
      })
        .then(response => response.json())
        .then(resolve)
        .catch(reject);
    })
  );

  const sleep = (timeout: number): Promise<void> => (
    new Promise(resolve => {
      window.setTimeout(resolve, timeout);
    })
  );

  const test = () => {
    setIsCooldown(true);

    fetchData()
      .then(({ query: { pages } }) => {
        setItems(Object.values(OSRS_WIKI_PAGE_IDS).map(id => pages[id]));
      })
      .catch(console.error)
      .finally(() => {
        sleep(5000).finally(() => setIsCooldown(false));
      });
  };

  return (
    <div>
      <h1>osrs-stuff</h1>
      <div className="app-col">
        <button type="button" onClick={() => setCount(increment)}>
          {`Count is ${count}`}
        </button>
        <button type="button" disabled={isCooldown} onClick={() => test()}>
          Test
        </button>
        <span className="app-row">
          {items.map(({ pageid, imageinfo: [info], title }) => (
            <a key={pageid} href={info.descriptionurl} target="_blank" rel="noreferrer">
              <button type="button">
                <img src={info.url} alt={title} />
              </button>
            </a>
          ))}
        </span>
      </div>
    </div>
  );
};
