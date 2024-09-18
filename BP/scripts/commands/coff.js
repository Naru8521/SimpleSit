import { Player, world } from "@minecraft/server";

/**
 * @param {Player} player 
 * @param {string[]} args 
 */
export function run(player, args) {
    const dimensionIds = ["overworld", "nether", "the_end"];

    for (const dimensionId of dimensionIds) {
        const dimension = world.getDimension(dimensionId);
        const chairs = dimension.getEntities({ type: "chair:chair" });

        for (const chair of chairs) {
            if (chair.nameTag.includes(player.id)) {
                chair.remove();
            }
        }
    }
}