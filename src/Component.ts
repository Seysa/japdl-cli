import { Browser, Page } from "puppeteer";
import path from "path";
import { ComponentFlags, MangaAttributes } from "./utils/types";
import url from "./utils/url";

class Component {
    WEBSITE = "https://www.japscan.ws";
    verbose: boolean;
    browser: Browser;
    fast: boolean;
    timeout: number;
    outputDirectory: string;

    constructor(browser: Browser, parameters: ComponentFlags & {outputDirectory: string})
    {
        this.outputDirectory = parameters.outputDirectory;
        this.verbose = parameters.verbose;
        this.fast = parameters.fast;
        this.timeout = parameters.timeout * 1000;
        this.browser = browser;
    }

    /** if page exists, go to it, else throw error
     * @param link link to go to
     * @returns a valid japscan page
     */
     async goToExistingPage(link: string, script = false): Promise<Page> {
        const page = await this.browser.newPage();
        if(script){
            await page.evaluateOnNewDocument((await import(path.join(__dirname, "inject/inject.js"))).default);
        }
        try {
            await page.goto(link, { timeout: this.timeout });
        } catch (e) {
            return await this.goToExistingPage(link);
        }
        if (await this.isJapscan404(page)) {
            throw new Error("La page " + link + " n'existe pas (404)");
        }
        this.verbosePrint(console.log, "Création de la page " + link);
        return page;
    }

    /**
     * @param page page to evaluate
     * @returns true if link it not a good link and false if the link is right
     */
    async isJapscan404(page: Page): Promise<boolean> {
        try {
            return (
                (await page.$eval(
                    "div.container:nth-child(2) > h1:nth-child(1)",
                    (element: Element) => element.innerHTML
                )) === "Oops!"
            );
        } catch (e) {
            return false;
        }
    }

    /**
     *
     * @param param can be a link or manga attributes
     * @returns path to manga without filename
     */
    getPathFrom(
        param:
            | string
            | MangaAttributes
    ): string {
        if (typeof param === "string") {
            return this.getPathFrom(url.getAttributesFromLink(param));
        } else {
            return `${this.outputDirectory}/${param.manga}/${param.chapter}/`;
        }
    }

    /**
     *
     * @param manga manga name
     * @param number number of volume or chapter
     * @param type usually 'volume' or 'chapitre'
     * @returns cbr path
     */
    getCbrFrom(manga: string, number: string, type: string): string {
        return path.resolve(`${this.outputDirectory}/${manga}/${manga}-${type}-${number}.cbr`);
    }
    /**
     * Only prints msg with printFunction if this.verbose is true
     * @param printFunction function used to print msg param
     * @param msg msg param to print
     */
     verbosePrint(printFunction: unknown, ...msg: unknown[]): void {
        if (this.verbose) {
            if (printFunction instanceof Function) {
                printFunction(...msg);
            } else {
                throw new Error("verbosePrint used with nonFunction parameter");
            }
        }
    }
}

export default Component;