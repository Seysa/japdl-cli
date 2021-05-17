import CLInterface from "../src/components/CLIInterface";

module.exports = {
    description: "Quitte le programme",
    usage: "quit",
    aliases: ["q"],
    argsNeeded: 0,
    async execute(inter: CLInterface): Promise<void> {
        inter.quit();
    }
}