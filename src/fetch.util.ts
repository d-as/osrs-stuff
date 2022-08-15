import { Assert } from './assert.util';

const { VITE_API_USER_AGENT } = import.meta.env;

Assert.notEmpty(VITE_API_USER_AGENT);

export const fetchData = <T>(url: string): Promise<T> => (
  new Promise((resolve, reject) => {
    fetch(url, {
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
