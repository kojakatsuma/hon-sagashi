import fs from "fs";
import puppeteer from "puppeteer";
import { getItems } from './getItems';
import { searchInOotaku, searchOfWakatiInOotaku } from "./searchInOotaku";

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })
  const page = await browser.newPage()
  console.log('init page')
  const titlelist = await getItems(page)
  const books = ['## 見つかった本']
  const maybeBooks = ['## 多分ある本']
  const unFoundBooks = ['## 見つからなかった本']
  for (const title of titlelist) {
    const link = await searchInOotaku(page, title)
    if (link) {
      books.push(`- [${title}](${link})`)
      continue
    }
    const maybeLink = await searchOfWakatiInOotaku(page, title)
    if (maybeLink) {
      maybeBooks.push(`- [${title}](${maybeLink})`)
      continue
    }
    unFoundBooks.push(`- ${title}`)
  }
  console.log('complete search')
  fs.writeFileSync(
    './result.md',
    books.concat(maybeBooks).concat(unFoundBooks).join('\n'),
    {
      encoding: 'utf-8',
    },
  )
  await browser.close()
})()
