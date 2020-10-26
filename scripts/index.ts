import fs from "fs";
import puppeteer from "puppeteer";
import { getItems } from './getItems';
import { search } from "./searchInOotaku";
import path from "path";

const chunk = (arr: string[], size: number) => {
  return arr.reduce(
    (newarr, _, i) => (i % size ? newarr : [...newarr, arr.slice(i, i + size)]),
    [] as string[][]
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
  const chunkSize = Math.round(titlelist.length > 10 ? titlelist.length * 0.1 : 1)
  console.log('chunk size is ', chunkSize)
  const books = await (await Promise.all(chunk(titlelist, chunkSize).map(titleChunk => search(browserWSEndpoint, titleChunk)))).flat()
  fs.writeFileSync(
    path.resolve(__dirname, '../front/src/result.json'),
    JSON.stringify(books),
    {
      encoding: 'utf-8',
    },
  )
  await browser.close()
})()
