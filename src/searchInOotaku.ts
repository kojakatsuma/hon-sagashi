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

export const searchInOotaku = async (wsEndpoint: string, title: string): Promise<[string | null, string[]] | []> => {
  const browser = await puppeteer.connect({ browserWSEndpoint: wsEndpoint })
  const page = await browser.newPage()
  await page.goto('https://www.lib.city.ota.tokyo.jp/index.html');
  await page.waitForSelector('.imeon');
  const search = await page.$('.imeon');
  if (!search) {
    return []
  }
  await search.type(title);
  await page.waitForSelector('input[name="buttonSubmit"]');
  await page.click('input[name="buttonSubmit"]');
  console.log(`searching for ${title}`);
  await page.waitForSelector('#honbun > section');

  const topLink = await page.evaluate(() => {
    const topResult = document.querySelector('#result > section > h3 > a') as HTMLLinkElement;
    return topResult?.href;
  });

  if (topLink) {
    const libs = await getLibs(page, topLink)
    browser.disconnect()
    return [topLink, libs];
  }

  const suggest = await page.$(
    '#honbun > section > div > div > div > div:nth-child(6) > div > dl > dd > a'
  );
  if (suggest) {
    await suggest.click();
    await page.waitForSelector('#honbun > section');
    const linkOfSuggest = await page.evaluate(() => {
      const topResult = document.querySelector('#result > section > h3 > a') as HTMLLinkElement;
      if (topResult) {
        return topResult.href;
      }
      return null;
    });
    if (!linkOfSuggest) {
      browser.disconnect()
      return []
    }
    const libs = await getLibs(page, linkOfSuggest)
    browser.disconnect()
    return [linkOfSuggest, libs];
  }
  browser.disconnect()
  return [];
};

export const searchOfWakatiInOotaku = async (wsEndpoint: string, title: string): Promise<[string | null, string[]] | []> => {
  const wakatiTitle = await wakatiGaki(title);
  return wakatiTitle ? await searchInOotaku(wsEndpoint, wakatiTitle) : [];
};
