import fs from "fs";
import puppeteer from "puppeteer";
import { getItems } from './getItems';
import { searchInOotaku } from "./searchInOotaku";

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
  const books = []
  for (const title of titlelist) {
    books.push(await searchInOotaku(browserWSEndpoint, title))
  }
  console.log(books)
  console.log('complete search')
  fs.writeFileSync(
    './result.md',
    books.join('\n'),
    {
      encoding: 'utf-8',
    },
  )
  await browser.close()
})()

