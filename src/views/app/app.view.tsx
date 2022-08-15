import { useState } from 'react';
import { Assert } from '@/assert.util';
import './app.view.scss';

const { VITE_API_USER_AGENT } = import.meta.env;

Assert.notEmpty(VITE_API_USER_AGENT);

const OSRS_WIKI_URL = 'https://osrs.wiki';
const OSRS_WIKI_API_URL = 'https://oldschool.runescape.wiki/api.php';
const EXCHANGE_API_URL = 'https://api.weirdgloop.org/exchange/history/osrs/latest';

enum MoneyMultiplier {
  ONE = '',
  BILLION = 'B',
  MILLION = 'M',
  THOUSAND = 'K',
}

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

const COX_UNIQUES = Object.values(CoXUnique).sort((a, b) => a.localeCompare(b));

const COX_PAGE_TITLES = COX_UNIQUES.map(item => `File:${item}.png`);

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

interface ExchangePrice {
  id: string
  timestamp: string
  price: number
  volume: number | null
}

interface ExchangeResponse {
  [name: string]: ExchangePrice
}

export const App = () => {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<OSRSWikiImagePage[]>([]);
  const [prices, setPrices] = useState<Partial<Record<CoXUnique, ExchangePrice>>>({});

  const fetchItemImages = (): Promise<OSRSWikiImageResponse> => (
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

  const fetchItemPrices = (): Promise<ExchangeResponse> => (
    new Promise((resolve, reject) => {
      fetch(`${EXCHANGE_API_URL}?name=${COX_UNIQUES.join('|')}`, {
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
    const [, name] = Assert.defined(filename.match(/File:(.+).png/));
    return name;
  };

  const fetchItems = () => {
    setLoading(true);

    const compareCoXPage = ({ title }: OSRSWikiImagePage): number => (
      COX_UNIQUES.indexOf(convertFilenameToItemName(title) as CoXUnique)
    );

    fetchItemImages()
      .then(({ query: { pages } }) => setItems(
        Object.values(pages).sort((a, b) => compareCoXPage(a) - compareCoXPage(b)),
      ))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const fetchPrices = () => {
    setLoading(true);

    fetchItemPrices()
      .then(data => setPrices(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const formatPrice = (price: number): [string, string, MoneyMultiplier] => {
    let multiplier: MoneyMultiplier = MoneyMultiplier.ONE;
    let truncatedPrice = price;

    if (price > 1e9) {
      multiplier = MoneyMultiplier.BILLION;
      truncatedPrice /= 1e9;
    } else if (price > 1e6) {
      multiplier = MoneyMultiplier.MILLION;
      truncatedPrice /= 1e6;
    } else if (price > 1e3) {
      multiplier = MoneyMultiplier.THOUSAND;
      truncatedPrice /= 1e3;
    }

    return [
      new Intl.NumberFormat('en-GB').format(price),
      new Intl.NumberFormat('en-GB', { maximumSignificantDigits: 3 }).format(truncatedPrice),
      multiplier,
    ];
  };

  const getPriceClassName = (price: number): string => {
    if (price >= 10e6) {
      return 'price-green';
    }
    if (price >= 100e3) {
      return 'price-white';
    }
    return 'price-yellow';
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
        <button
          type="button"
          className="app-button"
          disabled={loading || Object.keys(prices).length > 0}
          onClick={() => fetchPrices()}
        >
          Fetch Prices
        </button>
        <div className="app-grid">
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
        </div>
        <div className="app-row">
          {Object.keys(prices).length > 0 && (
            <div className="app-prices">
              {Object.entries(prices)
                .sort(([, a], [, b]) => b.price - a.price)
                .map(([name, { id, price }]) => {
                  const [formattedPrice, truncatedPrice, multiplier] = formatPrice(price);
                  return (
                    <span key={id} className="app-row">
                      <span className="price">{name}</span>
                      <span title={formattedPrice} className={getPriceClassName(price)}>
                        <span>{truncatedPrice}</span>
                        <strong>{multiplier}</strong>
                      </span>
                    </span>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
