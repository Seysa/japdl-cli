import puppeteer from "puppeteer-extra";
import path from "path";
import chrome from "./chrome";
import yargs from "yargs";

const flags = yargs(process.argv.slice(2))
            .option("t", { alias: "testing", boolean: true, default: false }).argv;

(async () => {
    const revision = chrome.getChromeInfos().revision;
    let platforms = [
        'linux'
        , 'win64'
    ];
    if(flags.t) platforms = ['linux'];
    for (const platform of platforms) {
        const fetcher = puppeteer.createBrowserFetcher({ platform: platform, path: path.resolve(".local-chromium/") })
        if (fetcher.canDownload(revision)) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            //@ts-ignore
            console.log(fetcher._getFolderPath(revision));
            console.log("Can download")
            await fetcher.download(revision).catch((error) => console.log(error));
            console.log("done");
        } else {
            console.log("Can't download for " + platform);
        }
    }
})();
