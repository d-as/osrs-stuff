import { useState } from 'react';
import '@views/App.scss';

const { VITE_API_USER_AGENT } = import.meta.env;

const OSRS_WIKI_URL = 'https://osrs.wiki';
const OSRS_WIKI_API_URL = 'https://oldschool.runescape.wiki/api.php';

enum CoXUnique {
  DEXTEROUS_PRAYER_SCROLL = 'Dexterous prayer scroll',
  ARCANE_PRAYER_SCROLL = 'Arcane prayer scroll',
  TWISTED_BUCKLER = 'Twisted buckler',
  DRAGON_HUNTER_CROSSBOW = 'Dragon hunter crossbow',
  DINHS_BULWARK = "Dinh's bulwark",
  ANCESTRAL_HAT = 'Ancestral hat',
  ANCESTRAL_ROBE_TOP = 'Ancestral robe top',
  ANCESTRAL_ROBE_BOTTOM = 'Ancestral robe bottom',
  DRAGON_CLAWS = 'Dragon claws',
  ELDER_MAUL = 'Elder maul',
  KODAI_INSIGNIA = 'Kodai insignia',
  TWISTED_BOW = 'Twisted bow',
}

const COX_UNIQUES = Object.values(CoXUnique);

const COX_PAGE_TITLES = COX_UNIQUES
  .map(item => `File:${item}.png`)
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
  query: {
    pages: Record<number, OSRSWikiImagePage>
  }
}

export const App = () => {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<OSRSWikiImagePage[]>([]);

  const fetchData = (): Promise<OSRSWikiImageResponse> => (
    new Promise((resolve, reject) => {
      fetch(`${
        OSRS_WIKI_API_URL
      }?action=query&titles=${COX_PAGE_TITLES.join('|')}&maxlag=5&format=json&prop=imageinfo&iiprop=url&origin=*`, {
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

  const convertFilenameToItemName = (filename: string): string => {
    const [, name] = filename.match(/File:(.+).png/) as RegExpMatchArray;
    return name;
  };

  const fetchItems = () => {
    setLoading(true);

    const compareCoXPage = ({ title }: OSRSWikiImagePage): number => (
      COX_UNIQUES.indexOf(convertFilenameToItemName(title) as CoXUnique)
    );

    fetchData()
      .then(({ query: { pages } }) => setItems(
        Object.values(pages).sort((a, b) => compareCoXPage(a) - compareCoXPage(b)),
      ))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  return (
    <div>
      <div className="app-col">
        <button
          type="button"
          className="app-button"
          disabled={loading || items.length > 0}
          onClick={() => fetchItems()}
        >
          Fetch Items
        </button>
        <span className="app-grid">
          {items.map(({ pageid, imageinfo: [info], title }) => {
            const name = convertFilenameToItemName(title);
            return (
              <a
                key={pageid}
                href={`${OSRS_WIKI_URL}/${name.replaceAll(' ', '_')}`}
                target="_blank"
                rel="noreferrer noopener"
              >
                <button type="button" className="app-icon-button" title={name}>
                  <img src={info.url} alt={name} draggable="false" />
                </button>
              </a>
            );
          })}
        </span>
      </div>
    </div>
  );
};
