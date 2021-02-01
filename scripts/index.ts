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

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })
  const browserWSEndpoint = browser.wsEndpoint();
  browser.disconnect()
  console.log('init page')
  const titlelist = await getItems(browserWSEndpoint)
  if (!titlelist.length) {
    console.log('not found items')
    await browser.close()
    process.exit()
  }
  const notFoundBooks = titlelist.filter(e => !results.find(r => r.title === e.title) || results.find(r => r.title === e.title && r.libs[0] === 'なし'))
  const chunkSize = Math.round(notFoundBooks.length > 10 ? notFoundBooks.length * 0.1 : 1)
  console.log('search target: ', notFoundBooks.length)
  console.log('chunk size is ', chunkSize)
  const books = await (await Promise.all(chunk(notFoundBooks, chunkSize).map(chunk => search(browserWSEndpoint, chunk)))).flat()
  const merged = results.map(result => {
    const book = books.find(b => b.title === result.title)
    if (book) {
      return book
    }
    return result
  })
  const newSearchBooks = books.filter(book => !results.find(r => r.title === book.title))
  const all = newSearchBooks.concat(merged)
  fs.writeFileSync(
    path.resolve(__dirname, '../front/src/result.json'),
    JSON.stringify(all),
    {
      encoding: 'utf-8',
    },
  )
  fs.writeFileSync(
    path.resolve(__dirname, './result.json'),
    JSON.stringify(all),
    {
      encoding: 'utf-8',
    },
  )
  await browser.close()
})()

