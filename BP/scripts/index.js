import { system, world } from "@minecraft/server";
import playerGetOffAfterEvent from "./events/playerGetOffAfterEvent";
import loadSitCommand from "./commands/sit";
import { config, defSetting, selectBlockIds } from "./config";
import Chair from "./modules/Chair";
import loadStandCommand from "./commands/stand";
import loadStandAllCommand from "./commands/standAll";
import loadSettingsCommand from "./commands/setting";

system.run(() => {
    if (world.getDynamicProperty(config.settingsDyId) === undefined) {
        world.setDynamicProperty(config.settingsDyId, JSON.stringify(defSetting));
        console.log("Chair settings have been initialized.");
    }

    Chair.standAll();
});

system.beforeEvents.startup.subscribe(ev => {
    const { customCommandRegistry } = ev;

    loadSitCommand(customCommandRegistry);
    loadStandCommand(customCommandRegistry);
    loadStandAllCommand(customCommandRegistry);
    loadSettingsCommand(customCommandRegistry);
});

system.runInterval(() => {
    const chairEntities = Chair.getAllChairs();

    for (const chairEntity of chairEntities) {
        /** @type {ChairData} */
        const { playerId, location } = JSON.parse(chairEntity.getDynamicProperty("data"));
        const player = getPlayerById(playerId);

        // プレイヤーが存在しない場合、エンティティを削除する
        if (!player) {
            chairEntity.remove();
            continue;
        }

        const rotation = player.getRotation();

        chairEntity.teleport(location);
        chairEntity.setRotation(rotation);
    }
});

playerGetOffAfterEvent.subscribe(ev => {
    const { entity, player } = ev;

    if (entity.typeId === "chair:chair") {
        /** @type {ChairSettings} */
        const { forceStandByCommandOnly } = JSON.parse(world.getDynamicProperty(config.settingsDyId));

        if (!forceStandByCommandOnly) Chair.stand(player);

        system.run(() => {
            Chair.entityRide(entity, player);
        });
    }
});

world.beforeEvents.playerInteractWithBlock.subscribe(ev => {
    const { player, block, itemStack, isFirstEvent } = ev;
    const location = { x: block.x + 0.5, y: block.y, z: block.z + 0.5 };

    // 最初のクリックでない場合
    if (!isFirstEvent) return;

    // ブロックが下を向いている時
    if (block.permutation.getAllStates()["upside_down_bit"]) return;

    // 上付きブロックであった時
    if (block.permutation.getAllStates()["minecraft:vertical_half"] === "top") return;

    // selectBlockIdsに含まれないブロックIDであった時
    if (!selectBlockIds.some(id => block.typeId.includes(id))) return;

    // アイテムを持っている時
    if (itemStack) return;

    Chair.sit(player, location);
});

/**
 * @param {string} playerId 
 */
function getPlayerById(playerId) {
    return world.getAllPlayers().filter(player => player.id === playerId)[0];
}