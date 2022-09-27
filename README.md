# Art Thief

Crawl and retrieve details about key content from a page.

Useful for search indexes and catalogues.


## When Building

You want to specify the platform.

```cli
docker build --platform linux/amd64 -t art-thief .
```


## Lambda Usage

In an API request body
```json
{ "url": "url-of-page-to-crawl" }
```

In another event
```json
{ "body": {"url": "url-of-page-to-crawl" } }
```


## Low-fidelity Local Testing

Outside the container.

```cli
yarn build && node ./dist/test.js
```


## What are the key details?

Look at the code.


