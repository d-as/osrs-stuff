import { ReactNode, useState } from 'react';
import { Assert } from '@/assert.util';
import { fetchData } from '@/fetch.util';
import './app.view.scss';

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

const COX_UNIQUES_SORTED = Object.values(CoXUnique).sort((a, b) => a.localeCompare(b));

const COX_PAGE_TITLES = COX_UNIQUES_SORTED.map(item => `File:${item}.png`);

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
  const [showNames, setShowNames] = useState(true);

  const fetchItemImages = (): Promise<OSRSWikiImageResponse> => (
    fetchData(`${
      OSRS_WIKI_API_URL
    }?action=query&titles=${
      COX_PAGE_TITLES.join('|')
    }&maxlag=5&format=json&prop=imageinfo&iiprop=url&origin=*`)
  );

  const fetchItemPrices = (): Promise<ExchangeResponse> => (
    fetchData(`${EXCHANGE_API_URL}?name=${COX_UNIQUES_SORTED.join('|')}`)
  );

  const convertFilenameToItemName = (filename: string): string => {
    const [, name] = Assert.defined(filename.match(/File:(.+).png/));
    return name;
  };

  const fetchItems = () => {
    setLoading(true);

    const compareCoXPage = ({ title }: OSRSWikiImagePage): number => (
      Object.values(CoXUnique).indexOf(convertFilenameToItemName(title) as CoXUnique)
    );

    Promise.all([
      fetchItemImages(),
      fetchItemPrices(),
    ])
      .then(([{ query: { pages } }, priceData]) => {
        setItems(Object.values(pages).sort((a, b) => compareCoXPage(a) - compareCoXPage(b)));
        setPrices(priceData);
      })
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

  const getPriceClassName = (price: number): string => (
    `price-${(() => {
      if (price >= 10e6) {
        return 'green';
      }
      return price >= 100e3 ? 'white' : 'yellow';
    })()}`
  );

  const getPriceElement = (name: CoXUnique): ReactNode => {
    const exchangePrice = prices[name];

    if (!exchangePrice) {
      return null;
    }

    const { price, id } = exchangePrice;
    const [formattedPrice, truncatedPrice, multiplier] = formatPrice(price);

    return (
      <span key={id} className="app-row">
        <span title={formattedPrice} className={getPriceClassName(price)}>
          <span>{truncatedPrice}</span>
          <strong>{multiplier}</strong>
        </span>
      </span>
    );
  };

  return (
    <div>
      <div className="app-col">
        <span className="app-row">
          <button
            type="button"
            className="w-100"
            disabled={loading || items.length > 0}
            onClick={() => fetchItems()}
          >
            Fetch Items
          </button>
          <button
            type="button"
            className="w-100"
            disabled={items.length === 0}
            onClick={() => setShowNames(show => !show)}
          >
            {`${showNames ? 'Hide' : 'Show'} Names`}
          </button>
        </span>
        <div className={`app-grid ${showNames ? 'app-grid-wide' : ''}`}>
          {items.map(({ pageid, imageinfo: [info], title }) => {
            const name = convertFilenameToItemName(title);
            const priceElement = getPriceElement(name as CoXUnique);

            return (
              <a
                key={pageid}
                className="app-icon-button"
                title={name}
                href={`${OSRS_WIKI_URL}/${name.replaceAll(' ', '_')}`}
                target="_blank"
                rel="noreferrer noopener"
              >
                <span className="app-row">
                  <span className="icon-wrapper">
                    <img src={info.url} alt={name} draggable="false" />
                  </span>
                  {showNames && <span className="price">{name}</span>}
                </span>
                <span>{priceElement}</span>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
};
