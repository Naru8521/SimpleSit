import { CommandPermissionLevel, CustomCommandRegistry, ItemStack, Player, world } from "@minecraft/server";
import { config } from "../config";
import Chair from "../modules/Chair";

/**
 * @param {CustomCommandRegistry} customCommandRegistry 
 */
export default function loadStandCommand(customCommandRegistry) {
    customCommandRegistry.registerCommand({
        name: `${config.commandPrefix}:stand`,
        description: "stand up.",
        permissionLevel: CommandPermissionLevel.Any,
        mandatoryParameters: [],
        optionalParameters: []
    }, (origin, ...args) => {
        const { sourceEntity } = origin;

        // 実行がプレイヤーであった時
        if (sourceEntity instanceof Player) {
            const player = sourceEntity;
            /** @type {ChairSettings} */
            const { allowStandTags } = JSON.parse(world.getDynamicProperty(config.settingsDyId));

            if (allowStandTags.length > 0) {
                const tags = player.getTags();
                const canStand = allowStandTags.some(tag => tags.includes(tag));

                if (!canStand) return;
            }

            Chair.stand(player);
        }
    });
}