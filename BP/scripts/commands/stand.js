import { config } from "../config";
import commandManager from "../modules/CommandManager";
import { Chair } from "../modules/Chair";

export function loadStandCommand() {
    const standCommand = commandManager.register({
        prefixes: config.command.prefixes,
        ids: config.command.ids,
        name: "stand",
        description: "その場で立つ"
    });

    console.log("load stand command.");

    standCommand.onCommand((args, player) => {
        Chair.stand(player);
    });

    standCommand.onScriptCommand((args, initiator, sourceEntity, sourceBlock) => {
        if (initiator instanceof Player) {
            Chair.stand(initiator);
        } else if (sourceEntity instanceof Player) {
            Chair.stand(sourceEntity);
        }
    });
}