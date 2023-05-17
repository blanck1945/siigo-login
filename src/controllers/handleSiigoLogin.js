import puppeteer from 'puppeteer';
import * as fs from 'fs/promises';

const handleSiigoLogin = async (event) => {
  const body = event;

  console.warn(
    `Starting request with username ${body.username} - password ${body.password}`,
  );

  let browser = await puppeteer.launch({
    userDataDir: 'tmp/dev',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setCacheEnabled(false);

  await page.goto('https://siigonube.siigo.com/ISIIGO2/Login.aspx');

  await page.waitForSelector('#ctl14_txtUserName');
  await page.type('#ctl14_txtUserName', body.username);

  await page.waitForSelector('#ctl14_txtPassword');
  await page.type('#ctl14_txtPassword', body.password);

  await Promise.all([
    page.waitForNavigation({}),
    page.click('#ctl14_btnLogOn'),
  ]);

  const cookies = await page.cookies();

  const TKN_cookie = cookies.filter((cookie) => cookie.name.startsWith('TKN'));

  await browser.close();

  await fs.rm('tmp/dev', { recursive: true });

  return getResponse(TKN_cookie.length > 0);
};

const getResponse = (isLogged) => {
  return {
    statusCode: isLogged ? 200 : 403,
    body: { message: isLogged ? 'OK' : 'Error' },
  };
};

export default handleSiigoLogin;
