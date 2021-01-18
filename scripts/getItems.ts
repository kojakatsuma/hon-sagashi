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
    'https://www.amazon.co.jp/hz/wishlist/ls/1LT97CIJHMD3V'
  );


  while (!await page.$('#endOfListMarker')) {
    await page.mouse.wheel({ deltaY: Number.MAX_SAFE_INTEGER })
  }
  await page.waitForSelector('#endOfListMarker')
  const titlelist = await page.evaluate(() => {
    const titles: { title: string, amazonUrl: string }[] = []
    document.querySelectorAll<HTMLLinkElement>('div.a-column.a-span12.g-span12when-narrow.g-span7when-wide > div:nth-child(1) > h3 > a')
      .forEach(({ textContent, href }) => textContent && href && titles.push({ title: textContent, amazonUrl: href }));
    return titles
  });
  console.log(`complete getItem: ${titlelist.length}`)
  browser.disconnect()
  return titlelist
};
