import { config } from "../config";
import commandManager from "../modules/CommandManager";
import { Chair } from "../modules/Chair";
import { Player, world } from "@minecraft/server";

export function loadSitCommand() {
    const sitCommand = commandManager.register({
        prefixes: config.command.prefixes,
        ids: config.command.ids,
        name: "sit",
        description: "その場に座る"
    });

    console.log("load sit command.");
    
    sitCommand.onCommand((args, player) => {
        Chair.sit(player);
    });

    sitCommand.onScriptCommand((args, initiator, sourceEntity, sourceBlock) => {
        if (initiator instanceof Player) {
            Chair.sit(initiator);
        } else if (sourceEntity instanceof Player) {
            Chair.sit(sourceEntity);
        }
    });
}