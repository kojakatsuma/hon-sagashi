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
    'https://www.amazon.co.jp/hz/wishlist/ls/1LT97CIJHMD3V?viewType=list'
  );


  while (!await page.$('#itemName_I2232M5YMFCV69')) {
    await page.mouse.wheel({ deltaY: Number.MAX_SAFE_INTEGER })
  }
  await page.waitForSelector('#itemName_I2232M5YMFCV69')
  const titlelist = await page.evaluate(() => {
    const titles: { title: string, amazonUrl: string }[] = []
    document.querySelectorAll<HTMLLinkElement>('div > div.a-column.a-span12.g-span12when-narrow.g-span7when-wide > div:nth-child(1) > h2 > a')
      .forEach(({ title, href }) => title && href && titles.push({ title, amazonUrl: href }));
    return titles
  });
  console.log(`complete getItem: ${titlelist.length}`)
  browser.disconnect()
  return titlelist
};
