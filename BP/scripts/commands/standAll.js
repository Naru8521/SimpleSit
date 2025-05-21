import { CommandPermissionLevel, CustomCommandRegistry, ItemStack, Player, world } from "@minecraft/server";
import { config } from "../config";
import Chair from "../modules/Chair";

/**
 * @param {CustomCommandRegistry} customCommandRegistry 
 */
export default function loadStandAllCommand(customCommandRegistry) {
    customCommandRegistry.registerCommand({
        name: `${config.commandPrefix}:standall`,
        description: "stand up all players in the world.",
        permissionLevel: CommandPermissionLevel.Admin,
        mandatoryParameters: [],
        optionalParameters: []
    }, (origin, ...args) => {
        Chair.standAll();
    });
}