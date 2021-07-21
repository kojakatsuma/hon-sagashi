import fs from "fs";
import puppeteer from "puppeteer";
import { getItems } from './getItems';
import { search } from "./searchInOotaku";
import path from "path";
import results from "./result.json";

function chunk<T>(arr: T[], size: number) {
  return arr.reduce(
    (newarr, _, i) => (i % size ? newarr : [...newarr, arr.slice(i, i + size)]),
    [] as T[][]
  )
}

const normalize = (string: string) => string.replace(/[^0-9A-Za-z\u3041-\u3096\u30A1-\u30F6\u3005-\u3006\u3400-\u3fff]/g, '');

const booksForSearch = (titleList: { amazonUrl: string, title: string }[]) => {
  const notFindedBooks: { amazonUrl: string, title: string }[] = []
  const findedBooks: {
    title: string;
    url: string;
    libs?: string[];
    isSuggest: boolean;
    isWakatiGaki: boolean;
    resultTitle: string;
    ndc?: string;
    amazonUrl: string;
  }[] = []
  titleList.forEach((t) => {
    const result = results.find(r => r.amazonUrl === t.amazonUrl)
    if (!result || result.url === 'なし' || normalize(result.resultTitle) !== normalize(t.title)) {
      notFindedBooks.push(t)
      return
    }
    findedBooks.push(result)
  })
  return { notFindedBooks, findedBooks }
}

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })
  const browserWSEndpoint = browser.wsEndpoint();
  browser.disconnect()
  console.log('init page')
  const hoshiimonoList = await getItems(browserWSEndpoint)
  if (!hoshiimonoList.length) {
    console.log('not found items')
    await browser.close()
    process.exit()
  }
  const { notFindedBooks, findedBooks } = booksForSearch(hoshiimonoList);
  const chunkSize = Math.round(notFindedBooks.length > 10 ? notFindedBooks.length * 0.1 : 1)
  console.log('search target count is  ', notFindedBooks.length)
  console.log('chunk size is ', chunkSize)
  const books = await (await Promise.all(chunk(notFindedBooks, chunkSize).map(chunk => search(browserWSEndpoint, chunk)))).flat()
  const merged = books.concat(findedBooks)
  fs.writeFileSync(
    path.resolve(__dirname, '../front/src/result.json'),
    JSON.stringify(merged),
    {
      encoding: 'utf-8',
    },
  )
  fs.writeFileSync(
    path.resolve(__dirname, '../scripts/result.json'),
    JSON.stringify(merged),
    {
      encoding: 'utf-8',
    },
  )
  await browser.close()
})()

