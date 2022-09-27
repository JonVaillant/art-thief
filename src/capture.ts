import * as playwright from 'playwright-aws-lambda';
import { getArticle } from './utilities/articles'

export const capture = async (url: string, isAws: boolean = false): Promise<string> => {
    console.log('launching browser')
    const browser = await playwright.launchChromium({
        // ...(isAws && {
        //     executablePath: '/usr/bin/google-chrome-stable'
        // }),
    });

    console.log('opening new page')
    const page = await browser.newPage();

    console.log('going to url', url)
    await page.goto(url, {
        timeout: 0
    });

    console.log('taking screenshot')
    const screenshotBuffer = await page.screenshot({ type: 'png' });

    console.log('taken screenshot', screenshotBuffer)

    // await page.exposeFunction('findArticle', findArticleContainer)

    // page.exposeFunction

    // const del = await page.$eval('body', (body: HTMLBodyElement) => findArticleContainer(body))

    // console.log('del', del.tagName)

    /* const t = */ await getArticle(page);

    // console.log('t', t)

    const x = await page.evaluate('window.outResult')

    Object.keys(x).forEach(xk => console.log('result key-value', xk, x[xk]))

    // const bodyEl = await page.evaluate('document.body')

    // console.log('bodyEl', bodyEl)

    // const articleHandle = await page.evaluate(() => findArticleContainer(), [bodyEl as HTMLElement])

    // console.log('body result', articleHandle)

    const base64DataUrl = `data:image/png;base64,${screenshotBuffer.toString('base64')}`

    await browser.close();

    return base64DataUrl;
}
