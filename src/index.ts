import { Context, APIGatewayProxyResult, APIGatewayEvent } from 'aws-lambda';
import { capture } from './capture';
import { ReqBody } from './interfaces/req-body.interface'

export const handler = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
    console.log(`Event: ${JSON.stringify(event, null, 2)}`);
    console.log(`Context: ${JSON.stringify(context, null, 2)}`);

    // Usually with requests the body is as you expect
    // for other events (as in test console), you'll need to add `"body":`
    if (!event.body) return {
        statusCode: 500,
        body: 'No body (event not from API? - add `body`)'
    }

    const body: ReqBody = JSON.parse(event.body) as ReqBody

    if (!body || !body.url) return {
        statusCode: 500,
        body: 'No URL provided'
    }

    try {
        new URL(body.url)
    } catch (e) {
        console.error('The URL is not valid')
        return {
            statusCode: 500,
            body: 'The URL is not valid. Check the protocols and subdomains are correct.'
        }
    }

    try {
        const screenshot = await capture(body.url, true);

        return {
            statusCode: 200,
            body: JSON.stringify({
                screenshot
            }),
        };
    } catch (e) {
        console.error('Screenshot capture failed', e)

        return {
            statusCode: 500,
            body: 'Screenshot capture failed.'
        }
    }
};
