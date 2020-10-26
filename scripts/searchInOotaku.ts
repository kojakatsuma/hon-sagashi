import { wakatiGaki } from './wakatiGaki';
import puppeteer, { Page } from 'puppeteer';

const getLibs = async (page: Page, detaliOfBookLink: string) => {
  await page.goto(detaliOfBookLink)
  await page.waitForSelector('div > table > tbody > tr > td.cent')
  const libs = await page.evaluate(() => {
    const libList: string[] = []
    document.querySelectorAll('div > table > tbody > tr > td.cent').forEach(lib => libList.push(lib.textContent || ''))
    return libList.filter(lib => lib)
  })
  return libs
}

export const search = async (wsEndpoint: string, titleChunk: string[]) => {
  const browser = await puppeteer.connect({ browserWSEndpoint: wsEndpoint })
  const page = await browser.newPage()
  const results = []
  const searchTitle = async (title: string) => {
    const [url, libs, isSuggest, isWakatiGaki, resultTitle] = await searchInOotaku(page, title)
    return { title, url, libs, isSuggest, isWakatiGaki, resultTitle }
  }
  for (const title of titleChunk) {
    try {
      results.push(await searchTitle(title))
    } catch (error) {
      console.log('error....retry')
      results.push(await searchTitle(title))
    }
  }
  browser.disconnect()
  return results
}

export const searchInOotaku = async (page: Page, title: string, isWakatiGaki: boolean = false): Promise<[string, string[], boolean, boolean, string]> => {
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
    const libs = await getLibs(page, topLink)
    return [topLink, libs, false, isWakatiGaki, topTitle];
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
      const libs = await getLibs(page, linkOfSuggest)
      return [linkOfSuggest, libs, true, isWakatiGaki, suggestTitle];
    }
  }
  if (!isWakatiGaki) {
    const wakatiTitle = await wakatiGaki(title);
    return await searchInOotaku(page, wakatiTitle, true)
  }

  return ["なし", ["なし"], true, isWakatiGaki, "なし"]
};
