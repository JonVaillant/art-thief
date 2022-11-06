![Art Thief](./content/art-thief.svg)

# Art Thief

Crawl and retrieve details about key content from a page.


## Uses

Useful for:
- search indexes
- catalogues
- providing content-based links in RSS readers etc.
- combine with ML for creating noun-to-content and topic-to-content indexes to surface content of real relevance
- correlate findings and link to original content of associated concepts
- readability-style extension (legally dubious when used on ad-supported pages)
    - but why? - ugly sites are not worth reading


## Features
- [x] Extract information about articles
- [ ] Extract primary cover or media from page
- [ ] Extract product information


## Example

![Before preview of article](./content/example-article.png)
*Source Content*

![After preview of retrieved details](./content/example-result.png)
*Content Details*


## Is this really for thieves or about stealing?

No. This is for extracting content for processing so you can index it in a search tool, catalogue, or linked topics in a basic RSS reader. Depending how you use it the use will be considered either legal or illegal, as with most things. For example, in most places it's legal to spit in private but not on the streets. Do be cautious as some organizations attempt to set new legal precedence. There have been cases where prominent search engines have been challenged over sharing links to news article with their full titles, because allegedly the article's value is in the title. Personally the technical struggle is really "how can I avoid crawling illegal content?" - when the inputs are not in my control.


## Is this better than the other content scrapers?

Yes it is. The other scrapers/readability tools don't get the whole article when the paragraphs are split into sections.


## Limitations

The tool cannot extract the body of "premium" articles as you would find on many websites that require sign in and payment. You could fork it for private use theoretically and make it sign in to those sites with your own paid membership's credentials.


## When Building

You want to specify the platform.

```cli
docker build --platform linux/amd64 -t art-thief .
```


## Lambda Configuration

- Memory: 2560 MB
- Timeout: 50s


## Lambda Usage

Just pass in the URL of the site. The URL must include the protocol and match an existing page, as in `"https://www.wikipedia.org"` VS `"wikipedia.org"`.

### Usage with Live API
In an AWS API or Function URL request body:
```json
{ "url": "url-of-page-to-crawl" }
```

### Usage with function console or Docker port
On the AWS function console's test panel and when hitting the docker endpoint locally you must wrap your request body with "body".
```json
{ "body": {"url": "url-of-page-to-crawl" } }
```


## Locally verify crawl results

- A) Run the test script outside the container to test just the code
    - `yarn build && node ./dist/test.js`
    - This test script doesn't log the results properly at present so it's better just to hit the docker image endpoint (see B)
- B) Run and test the image using the endpoint ([see usage](https://gallery.ecr.aws/lambda/nodejs))
    - `docker build -t art-thief .`
        - This container must be AMD not ARM, so build as AMD: `docker build --platform linux/amd64 -t art-thief .` 
    - `docker run -p 9000:8080 art-thief`
    - `curl -XPOST "http://localhost:9000/2015-03-31/functions/function/invocations" -d '{"body": "{\"url\": \"https://www.nytimes.com/2022/09/27/well/eat/matcha-health-benefits.html\"}"}'`
        - You can change the URL to the page you wish to check
        - Note that this endpoint is not properly formatted JSON, so in Postman it won't look nice (fortunately on AWS the API endpoints are JSON)


## What are the key details returned?

Look at the code within `./src/interfaces`.


## Resources

- [Amazon NodeJS Lambda Images](https://gallery.ecr.aws/lambda/nodejs)
