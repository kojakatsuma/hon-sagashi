const { writeFileSync } = require('fs')
const puppeteer = require('puppeteer')
const util = require('util')
const exec = util.promisify(require('child_process').exec)

;(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })
  const page = await browser.newPage()
  console.log('init page')
  const titlelist = await getItems(page)
  console.log('complete getItem')
  const books = ['## 見つかった本']
  const maybeBooks = ['## 多分ある本']
  const unFoundBooks = ['## 見つからなかった本']
  for (const title of titlelist) {
    const link = await search(page, title)
    if (link) {
      books.push(`- [${title}](${link})`)
      continue
    }
    const wakatiTitle = await searchForWakati(title)
    if (wakatiTitle) {
      const maybeLink = await search(page, wakatiTitle)
      if (maybeLink) {
        maybeBooks.push(`- [${title}](${maybeLink})`)
        continue
      }
    }
    unFoundBooks.push(`- ${title}`)
  }
  console.log('complete search')
  writeFileSync(
    './result.md',
    books.concat(maybeBooks).concat(unFoundBooks).join('\n'),
    {
      encoding: 'utf-8',
    },
  )
  await browser.close()
})()

const search = async (page, title) => {
  await page.goto('https://www.lib.city.ota.tokyo.jp/index.html')
  await page.waitForSelector('.imeon')
  const search = await page.$('.imeon')
  await search.type(title)
  await page.waitForSelector('input[name="buttonSubmit"]')
  await page.click('input[name="buttonSubmit"]')
  console.log(`searching for ${title}`)
  await page.waitForSelector('#honbun > section')

  const topLink = await page.evaluate(() => {
    const topResult = document.querySelector('#result > section > h3 > a')
    if (topResult) {
      return topResult.href
    }
    return null
  })

  if (topLink) {
    return topLink
  }

  const suggest = await page.$(
    '#honbun > section > div > div > div > div:nth-child(6) > div > dl > dd > a',
  )
  if (suggest) {
    await suggest.click()
    await page.waitForSelector('#honbun > section')
    const linkOfSuggest = await page.evaluate(() => {
      const topResult = document.querySelector('#result > section > h3 > a')
      if (topResult) {
        return topResult.href
      }
      return null
    })
    return linkOfSuggest
  }
  return null;
}

const getItems = async (page) => {
  await page.goto(
    'https://www.amazon.co.jp/hz/wishlist/ls/1LT97CIJHMD3V?ref_=wl_share',
  )
  while (
    await page.evaluate(
      () => !document.querySelector('#endOfListMarker > div > h5'),
    )
  ) {
    await page.mouse.wheel({ deltaY: Number.MAX_SAFE_INTEGER })
  }

  await page.waitForSelector('#endOfListMarker > div > h5', { timeout: 50000 })
  const titlelist = await page.evaluate(() => {
    const title = []
    document
      .querySelectorAll('h3.a-size-base > a')
      .forEach(({ textContent }) => title.push(textContent))
    return title
  })
  return titlelist
}

const searchForWakati = async (title) => {
  const { stdout, stderr } = await exec(`echo "${title}" | mecab -Owakati`)
  if (stderr) {
    console.log(stderr)
    return null
  }
  return stdout
}
