import fs from "fs";
import puppeteer from "puppeteer";
import { getItems } from './getItems';
import { search } from "./searchInOotaku";

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
  const books = await (await Promise.all(chunk(titlelist, 10).map(titleChunk => search(browserWSEndpoint, titleChunk)))).flat()
  fs.writeFileSync(
    './result.md',
    books.map(({ title, url, libs }) => `- [${title}](${url}): ${libs.join(',')}`).join('\n'),
    {
      encoding: 'utf-8',
    },
  )
  await browser.close()
})()

