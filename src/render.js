const puppeteer = require("puppeteer");
const cron = require('node-cron');

// Buttons
const startBtn = document.getElementById('startBtn');
startBtn.onclick = async () => {
  cron.schedule(`* * * * *`, async () => {
    const number = await initBrowser();
    startBtn.innerText = number;
  });
};

// Opens browser do scraping
async function initBrowser() {
  this.browser = await puppeteer.launch({
    headless: true
  });
  this.page = await browser.newPage();
  await this.page.setViewport({ height: 1440, width: 1920 });
  await Promise.all([
    page.goto(`https://grandmaster.report/user/3/4611686018487695004`),
    page.waitForNavigation({ waitUntil: 'networkidle0' }),
  ]);
  console.log('page loaded')

  const data = await page
    .evaluate(() => document.querySelector("div:nth-child(4) p:first-child").textContent)
    .catch(err => console.log(err));
  const text = data.split(".");
  const number = text[1].split(":");
  const final = parseInt(number[1])
  await page.close();
  return final;
}