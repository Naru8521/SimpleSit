import { Player } from "@minecraft/server";
import { Chair } from "../libs/chair";

/**
 * @param {Player} player 
 * @param {string[]} args 
 */
export function run(player, args) {
    new Chair(player).sit();
}