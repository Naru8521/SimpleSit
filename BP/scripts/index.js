import { world } from "@minecraft/server";
import CommandHandler from "./libs/commandHandler";
import { commands, commandSetting, commandsPath, selectBlocks } from "./config";
import { Chair } from "./libs/chair";

const commandHandler = new CommandHandler(commandsPath, commandSetting, commands, true);

world.beforeEvents.chatSend.subscribe(ev => {
    commandHandler.handleCommand(ev);
});

world.beforeEvents.playerInteractWithBlock.subscribe(ev => {
    const { block, player, itemStack, isFirstEvent } = ev;
    const dimensionId = player.dimension.id;
    const dimension = world.getDimension(dimensionId);
    const checkBlock = dimension.getBlock({ x: block.x, y: block.y + 1, z: block.z });
    const lastName = block.typeId.split("_")[block.typeId.split("_").length - 1];
    const location = { x: block.x + 0.5, y: block.y + 0.25, z: block.z + 0.5 };

    if (!isFirstEvent) return;
    if (player.sit) return;
    if (block.permutation.getAllStates()["upside_down_bit"]) return;
    if (block.permutation.getAllStates()["minecraft:vertical_half"] === "top") return;
    if (!selectBlocks.includes(lastName)) return;
    if (player.isSneaking) return;
    if (!checkBlock.isAir) return;
    if (itemStack) return;

    new Chair(player).sit(location);
});