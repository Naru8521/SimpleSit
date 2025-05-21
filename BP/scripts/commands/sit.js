import { CommandPermissionLevel, CustomCommandRegistry, ItemStack, Player, world } from "@minecraft/server";
import { config } from "../config";
import Chair from "../modules/Chair";

/**
 * @param {CustomCommandRegistry} customCommandRegistry 
 */
export default function loadSitCommand(customCommandRegistry) {
    customCommandRegistry.registerCommand({
        name: `${config.commandPrefix}:sit`,
        description: "sit in place.",
        permissionLevel: CommandPermissionLevel.Any,
        mandatoryParameters: [],
        optionalParameters: []
    }, (origin, ...args) => {
        const { sourceEntity } = origin;

        // 実行がプレイヤーであった時
        if (sourceEntity instanceof Player) {
            const player = sourceEntity;
            /** @type {ChairSettings} */
            const { allowSitTags } = JSON.parse(world.getDynamicProperty(config.settingsDyId));

            if (allowSitTags.length > 0) {
                const tags = player.getTags();
                const canSit = allowSitTags.some(tag => tags.includes(tag));

                if (!canSit) return;
            }

            Chair.sit(player);
        }
    });
}