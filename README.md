# Chrome Extensions API Dash Docset

## Prereqs

Fairly recent version of [NodeJS](https://nodejs.org/en/).

## "I want to run the script and get the latest docs!"

In that case, download this repo and run `npm i && npm run build` in the project directory.

This will start scraping the official documentation live from [`https://developer.chrome.com/docs/extensions/reference/`](https://developer.chrome.com/docs/extensions/reference/).

If successful, your docset will be rendered in two formats -- as a `.docset` folder and a `.tgz` file.

**NOTE**: Changes in site layout can either break this scraper entirely or in part.

## "I don't want to regenerate the docs!"

Visit the [Releases page](https://github.com/cuylerstuwe/chrome-extensions-api-dash-docset/releases) to download the latest docset I've compiled.

## Motive / Credits

This was adapted from [a script](https://github.com/gebrkn/bits/blob/a0db9ee8e9fdc9f6baea50061796525ffcbd2671/chromeapi_docset.js) originally written by Georg Barikin ([@gebrkn](https://github.com/gebrkn)).

As of the time of this writing, [the version of the Chrome Extension docs in the official Dash user-contribted repository](https://github.com/Kapeli/Dash-User-Contributions/tree/master/docsets/Chrome_Extensions_API#readme) is **very old**, corresponding to the platform as it existed all the way back in Chrome **61**. That version of Chrome was released back in [September of 2017](https://en.wikipedia.org/wiki/Google_Chrome_version_history#:~:text=61.0.3163,picker%5Br%20144%5D). It's so old that [at the time it was released, deprecating Flash was just a twinkle in Adobe's eye](http://web.archive.org/web/20170725160902/https://techcrunch.com/2017/07/25/get-ready-to-say-goodbye-to-flash-in-2020/).

<img width="501" alt="Screen Shot 2022-05-14 at 4 12 46 PM" src="https://user-images.githubusercontent.com/20496944/168450956-d378f973-68bc-40b6-8e73-d40d2dc44f9f.png">
