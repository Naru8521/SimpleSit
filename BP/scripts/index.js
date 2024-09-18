import { world } from "@minecraft/server";
import { CommandHandler } from "./libs/commandHandler";
import { commandConfig, selectBlocks } from "./config";
import { Chair } from "./libs/chair";

const commandHandler = new CommandHandler(commandConfig.path, commandConfig.setting, commandConfig.commands, true);

world.beforeEvents.chatSend.subscribe(ev => {
    commandHandler.check(ev);
});

world.beforeEvents.playerInteractWithBlock.subscribe(ev => {
    const { block, player, itemStack } = ev;
    const dimensionId = player.dimension.id;
    const dimension = world.getDimension(dimensionId);
    const checkBlock = dimension.getBlock({ x: block.x, y: block.y + 1, z: block.z });
    const lastName = block.typeId.split("_")[block.typeId.split("_").length - 1];
    const location = { x: block.x + 0.5, y: block.y + 0.25, z: block.z + 0.5 };

    if (player.sit) return;
    if (block.permutation.getAllStates()["minecraft:vertical_helf"] === "top") return;
    if (!selectBlocks.includes(lastName)) return;
    if (player.isSneaking) return;
    if (!checkBlock.isAir) return;
    if (itemStack) return;

    new Chair(player).sit(location);
});