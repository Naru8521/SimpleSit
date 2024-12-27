import { Block, Entity, Player, world } from "@minecraft/server";

/**
 * @param {string[]} args 
 * @param {{ player: Player?, entity: Entity?, initiator: Entity?, block: Block? }} ev 
 */
export function run(args, ev) {
    const { player, entity, initiator, block } = ev;
    const dimensionIds = ["overworld", "nether", "the_end"];

    if (player) {
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
}