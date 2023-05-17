require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const puppeteer = require('puppeteer');
const fs = require('fs/promises');

const app = express();
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send("It's working!");
});

app.get('/siigo/login', async (req, res) => {
  const params = req.query;

  console.warn(
    `Starting request with username ${params.username} - password ${params.password}`,
  );

  let browser = await puppeteer.launch({
    userDataDir: 'tmp/dev',
  });

  const page = await browser.newPage();
  await page.setCacheEnabled(false);

  await page.goto('https://siigonube.siigo.com/ISIIGO2/Login.aspx');

  await page.waitForSelector('#ctl14_txtUserName');
  await page.type('#ctl14_txtUserName', params.username);

  await page.waitForSelector('#ctl14_txtPassword');
  await page.type('#ctl14_txtPassword', params.password);

  await Promise.all([
    page.waitForNavigation({}),
    page.click('#ctl14_btnLogOn'),
  ]);

  const cookies = await page.cookies();

  const TKN_cookie = cookies.filter((cookie) => cookie.name.startsWith('TKN'));

  console.warn(`TKN cookie: ${JSON.stringify(TKN_cookie)}`);

  await browser.close();

  await fs.rm('tmp/dev', { recursive: true });

  return res.send(getResponse(TKN_cookie.length > 0));
});

const getResponse = (isLogged) => {
  return {
    statusCode: isLogged ? 200 : 403,
    body: { message: isLogged ? 'OK' : 'Error' },
  };
};

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
