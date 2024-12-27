import { Block, Entity, Player } from "@minecraft/server";
import { Chair } from "../libs/chair";

/**
 * @param {string[]} args 
 * @param {{ player: Player?, entity: Entity?, initiator: Entity?, block: Block? }} ev 
 */
export function run(args, ev) {
    const { player, entity, initiator, block } = ev;

    if (player) {
        new Chair(player).sit();
    }
}