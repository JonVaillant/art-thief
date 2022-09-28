import * as playwright from 'playwright-aws-lambda';
import { FoundArticle } from './interfaces/found-article.interface';
import { ResBody } from './interfaces/res-body.interface';
import { getArticle } from './utilities/articles'

export const capture = async (url: string, isAws: boolean = false): Promise<ResBody> => {
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

    // console.log('taking screenshot')
    // const screenshotBuffer = await page.screenshot({ type: 'png' });

    // console.log('taken screenshot', screenshotBuffer)

    await getArticle(page);

    const foundArticle: FoundArticle = await page.evaluate('window.foundArticle')

    Object.keys(foundArticle).forEach(key => console.log('result key-value', key, foundArticle[key]))

    // const base64DataUrl = `data:image/png;base64,${screenshotBuffer.toString('base64')}`

    await browser.close();

    const resBody: ResBody = {
        url,
        foundArticle
    }

    return resBody;
}
