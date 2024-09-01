import { system, world } from "@minecraft/server";
import * as Chair from "./components/chair";
import { selectBlocks } from "./config";

world.afterEvents.worldInitialize.subscribe(() => {
    Chair.killAll();
});

world.beforeEvents.chatSend.subscribe(ev => {
    const { sender: player, message } = ev;

    if (message === "sit") {
        ev.cancel = true;

        const { x, y, z } = player.location;
        const dimensionId = player.dimension.id;
        const dimension = world.getDimension(dimensionId);
        const downblock = dimension.getBlock({ x: x, y: y - 1, z: z });
        const upblock = dimension.getBlock({ x: x, y: y + 1, z: z });
        let location;

        if (player.sit) return;
        if (player.isSneaking) return;
        if (!upblock.isAir) return;
        if (downblock.isAir) return;
        if (y > Math.floor(y)) {
            location = { x: x, y: y - 0.13, z: z };
        } else {
            location = { x: x, y: downblock.y + 0.8, z: z };
        }

        player.sit = true;
        Chair.sit(player, location);
    } else if (message === "coff") {
        ev.cancel = true;

        const chair = Chair.get(player);
        
        if (chair) {
            Chair.kill(chair);
        }
    }
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

    player.sit = true;
    Chair.sit(player, location);
});

world.beforeEvents.playerLeave.subscribe(ev => {
    const { player } = ev;
    const chair = Chair.get(player);

    if (chair) {
        Chair.kill(chair);
    }
});

system.runInterval(() => {
    const players = world.getAllPlayers();

    for (const player of players) {
        Chair.teleport(player);
    }
});