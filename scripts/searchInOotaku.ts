import { wakatiGaki } from './wakatiGaki';
import puppeteer, { Page } from 'puppeteer';
import NDC from './NDC.json'

// const getLibs = async (page: Page, detaliOfBookLink: string) => {
//   await page.goto(detaliOfBookLink)
//   await page.waitForSelector('div > table > tbody > tr > td.cent')
//   const libs = await page.evaluate(() => {
//     const libList: string[] = []
//     document.querySelectorAll('div > table > tbody > tr > td.cent').forEach(lib => libList.push(lib.textContent || ''))
//     return libList.filter(lib => lib)
//   })
//   const ndc = await page.evaluate(() => {
//     return document.evaluate("//th[contains(., 'ＮＤＣ１０')]/following-sibling::td/span/span", document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null).snapshotItem(0)?.textContent || ''
//   }).then(ndc => NDC.find(({ id }) => id === ndc.substr(0, 2))?.name || '')
//   return { libs, ndc }
// }

export const search = async (wsEndpoint: string, chunk: { title: string; amazonUrl: string }[]) => {
  const browser = await puppeteer.connect({ browserWSEndpoint: wsEndpoint })
  const page = await browser.newPage()
  const results = []
  const searchTitle = async (title: string) => {
    const [url, isSuggest, isWakatiGaki, resultTitle] = await searchInOotaku(page, title)
    return { title, url, isSuggest, isWakatiGaki, resultTitle }
  }
  for (const { title, amazonUrl } of chunk) {
    try {
      results.push({ ...await searchTitle(title), amazonUrl })
    } catch (error) {
      console.log('error....retry')
      results.push({ ...await searchTitle(title), amazonUrl })
    }
  }
  browser.disconnect()
  return results
}

export const searchInOotaku = async (page: Page, title: string, isWakatiGaki: boolean = false): Promise<[string, boolean, boolean, string]> => {
  await page.goto('https://www.lib.city.ota.tokyo.jp/index.html');
  await page.waitForSelector('.imeon');
  const search = await page.$('.imeon');
  if (!search) {
    throw new Error('undefind Search page')
  }
  await search.type(title);
  await page.waitForSelector('input[name="buttonSubmit"]');
  await page.click('input[name="buttonSubmit"]');
  console.log(`searching for ${title}`);
  await page.waitForSelector('#honbun > section');

  const [topLink, topTitle] = await page.evaluate(() => {
    const topResult = document.querySelector('#result > section > h3 > a') as HTMLLinkElement;
    return [topResult?.href, topResult?.textContent || "なし"];
  });

  if (topLink) {
    return [topLink, false, isWakatiGaki, topTitle];
  }

  const suggest = await page.$(
    '#honbun > section > div > div > div > div:nth-child(6) > div > dl > dd > a'
  );

  if (suggest) {
    await suggest.click();
    await page.waitForSelector('#honbun > section');
    const [linkOfSuggest, suggestTitle] = await page.evaluate(() => {
      const topResult = document.querySelector('#result > section > h3 > a') as HTMLLinkElement;
      return [topResult?.href, topResult?.textContent || ""];
    });

    if (linkOfSuggest) {
      return [linkOfSuggest, true, isWakatiGaki, suggestTitle];
    }
  }
  if (!isWakatiGaki) {
    const wakatiTitle = await wakatiGaki(title);
    return await searchInOotaku(page, wakatiTitle, true)
  }

  return ["なし", true, isWakatiGaki, "なし"]
};

