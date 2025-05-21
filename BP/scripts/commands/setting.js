import { CommandPermissionLevel, CustomCommandRegistry, ItemStack, Player, system, world } from "@minecraft/server";
import { config } from "../config";
import SettingsMenuForm from "../forms/SettingsMenu";

/**
 * @param {CustomCommandRegistry} customCommandRegistry 
 */
export default function loadSettingsCommand(customCommandRegistry) {
    customCommandRegistry.registerCommand({
        name: `${config.commandPrefix}:settings`,
        description: "open chair settings form.",
        permissionLevel: CommandPermissionLevel.Admin,
        mandatoryParameters: [],
        optionalParameters: []
    }, (origin, ...args) => {
        const { sourceEntity } = origin;

        // 実行がプレイヤーであった時
        if (sourceEntity instanceof Player) {
            const player = sourceEntity;

            system.run(() => {
                SettingsMenuForm(player);
            });
        }
    });
}