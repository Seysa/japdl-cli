import Interface from "../src/interface";
import utils from "../src/utils";

module.exports = {
    description: "Fabrique un cbr du volume|chapitre indiqué",
    usage: "zip <manga-name> <volume|chapitre> <numéro>",
    aliases: ["z", "cbr"],
    async execute(inter: Interface, args: string[]): Promise<void> {
        if (args.length < 3) {
            throw "Il manque des arguments à cette commande";
        }
        const mangaName = args[0];
        const type = args[1];
        if (type !== "volume" && type !== "chapitre") {
            throw `japdl ne peut pas zipper de ${type}, il ne peut zipper que:
        - 'volume'
        - 'chapitre'`
        }
        const number = parseInt(args[2]);
        let toZip: string[] = [];
        if (type === 'chapitre') {
            const path = inter.getPathFrom({ chapter: number.toString(), manga: mangaName, page: "" + 1 });
            console.log(path);
            toZip = [path];
        }
        if (type === 'volume') {
            const chapters: string[] = await inter.fetchVolumeChapters(number, mangaName);
            chapters.forEach((chapter) => {
                toZip.push(inter.getPathFrom(chapter));
            });
        }
        const isWorthZipping = utils.path.tellIfDoesntExist(toZip);
        if (isWorthZipping) {
            utils.zipper.zipDirectories(toZip, inter.getCbrFrom(mangaName, number, type));
        }
    }
}