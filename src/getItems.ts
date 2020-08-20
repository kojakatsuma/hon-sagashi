import { Page } from 'puppeteer';

export const getItems = async (page: Page) => {
  await page.goto(
    'https://www.amazon.co.jp/hz/wishlist/ls/1LT97CIJHMD3V?ref_=wl_share'
  );
  while (await page.evaluate(
    () => !document.querySelector('#endOfListMarker > div > h5')
  )) {
    const mouse  = page.mouse
    await mouse.wheel({ deltaY: Number.MAX_SAFE_INTEGER })
  }

  await page.waitForSelector('#endOfListMarker > div > h5', { timeout: 50000 });
  const titlelist = await page.evaluate(() => {
    const title: string[] = [];
    document
      .querySelectorAll('h3.a-size-base > a')
      .forEach(({ textContent }) => textContent && title.push(textContent));
    return title;
  });
  console.log('complete getItem')
  return titlelist;
};
