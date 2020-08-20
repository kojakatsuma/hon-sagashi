import { wakatiGaki } from './wakatiGaki';
import { Page } from 'puppeteer';

export const searchInOotaku = async (page: Page, title: string): Promise<string | null> => {
  await page.goto('https://www.lib.city.ota.tokyo.jp/index.html');
  await page.waitForSelector('.imeon');
  const search = await page.$('.imeon');
  if (!search) {
    return null
  }
  await search.type(title);
  await page.waitForSelector('input[name="buttonSubmit"]');
  await page.click('input[name="buttonSubmit"]');
  console.log(`searching for ${title}`);
  await page.waitForSelector('#honbun > section');

  const topLink = await page.evaluate(() => {
    const topResult = document.querySelector('#result > section > h3 > a') as HTMLLinkElement;
    if (topResult) {
      return topResult.href;
    }
    return null;
  });

  if (topLink) {
    return topLink;
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
    return linkOfSuggest;
  }
  return null;
};

export const searchOfWakatiInOotaku = async (page: Page, title: string): Promise<string | null> => {
  const wakatiTitle = await wakatiGaki(title);
  return wakatiTitle ? await searchInOotaku(page, wakatiTitle) : null;
};
