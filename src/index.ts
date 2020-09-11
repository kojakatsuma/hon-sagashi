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
  if (!titlelist.length) {
    console.log('not found items')
    await browser.close()
    process.exit()
  }
  const books = ['## 見つかった本']
  const maybeBooks = ['## 多分ある本']
  const unFoundBooks = ['## 見つからなかった本']
  for (const title of titlelist) {
    const [link, libs] = await searchInOotaku(page, title)
    if (link) {
      books.push(`- [${title}](${link})`)
      if (libs) {
        books.push(`\t - ${libs.join(',')}`)
      }
      continue
    }
    const [maybeLink, maybeLibs] = await searchOfWakatiInOotaku(page, title)
    if (maybeLink) {
      maybeBooks.push(`- [${title}](${maybeLink})`)
      if (maybeLibs) {
        maybeBooks.push(`\t - ${maybeLibs.join(',')}`)
      }
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

