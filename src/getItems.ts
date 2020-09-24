import puppeteer from 'puppeteer';

export const getItems = async (wsEndpoint: string) => {
  const browser = await puppeteer.connect({ browserWSEndpoint: wsEndpoint })
  const page = await browser.newPage()
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'webdriver', {
      get: () => undefined,
    });
  })
  await page.goto(
    'https://www.amazon.co.jp/hz/wishlist/printview/1LT97CIJHMD3V'
  );

  await page.waitForSelector(".a-align-center > .a-text-bold")

  const titlelist = await page.evaluate(() => {
    const title: string[] = [];
    document.querySelectorAll(".a-align-center > .a-text-bold")
      .forEach(({ textContent }) => textContent && title.push(textContent));
    return title;
  });
  console.log(`complete getItem: ${titlelist.length}`)
  browser.disconnect()
  return titlelist;
};
