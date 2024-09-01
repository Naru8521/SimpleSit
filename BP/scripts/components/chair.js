import { Entity, Player, system, world } from "@minecraft/server";

export const chairMap = new Map();

/**
 * イスに座ります
 * @param {Player} player 
 * @param {import("@minecraft/server").Vector3} location
 * @param {boolean} stair_half_block
 */
export function sit(player, location) {
    const playerId = player.id;
    const dimensionId = player.dimension.id;
    const x = location.x.toFixed(1);
    const y = location.y.toFixed(1);
    const z = location.z.toFixed(1);

    if (!chairMap.has(playerId)) {
        for (const key of chairMap.keys()) {
            const data = chairMap.get(key);

            if (
                data.dimensionId === dimensionId &&
                data.location.x === x &&
                data.location.y === y &&
                data.location.z === z
            ) return;
        }

        system.run(() => {
            const playerId = player.id;
            const dimension = world.getDimension(dimensionId);
            const chair = dimension.spawnEntity("chair:chair", location);

            chair.nameTag = `chair_${playerId}`;
            chair.getComponent("rideable").addRider(player);
            chairMap.set(playerId, {
                entityName: chair.nameTag,
                dimensionId: dimensionId,
                location: location
            });
        });
    }
}

/**
 * イスから降ります
 * @param {Player} player 
 */
export function getOff(player) {
    const playerId = player.id;

    if (chairMap.has(playerId)) {
        const data = chairMap.get(playerId);
        const dimensionId = data.dimensionId;
        const location = data.location;
        const dimension = world.getDimension(dimensionId);
        const chair = get(player);

        player.teleport({ x: location.x, y: location.y + 1, z: location.z }, { dimension: dimension });
        kill(chair);
    }
}

/**
 * イスを固定します
 * @param {Player} player 
 */
export function teleport(player) {
    const playerId = player.id;

    if (chairMap.has(playerId)) {
        const rotation = player.getRotation();
        const data = chairMap.get(playerId);
        const dimensionId = data.dimensionId;
        const location = data.location;
        const dimension = world.getDimension(dimensionId);
        const chair = get(player);

        if (chair) {
            const chairLocation = {
                x: Math.floor(data.location.x),
                y: Math.floor(data.location.y),
                z: Math.floor(data.location.z)
            };

            chair.teleport(location, { dimension: dimension });
            chair.setRotation(rotation);

            if (dimension.getBlock(chairLocation).isAir) {
                kill(chair);
                return;
            }

            if (!player.hasComponent("riding")) {
                kill(chair);
                return;
            }
        }
    }
}

/**
 * プレイヤーのイスを取得します
 * @param {Player} player 
 * @returns {Entity}
 */
export function get(player) {
    const playerId = player.id;

    if (chairMap.has(playerId)) {
        const data = chairMap.get(playerId);
        const dimensionId = data.dimensionId;
        const chairName = data.entityName;
        const dimension = world.getDimension(dimensionId);
        const chair = dimension.getEntities({ name: chairName })[0];

        return chair;
    }

    return null;
}

/**
 * idからプレイヤーを取得します
 * @param {string} id
 * @returns {Player}
 */
export function getPlayer(id) {
    const players = world.getAllPlayers();

    for (const player of players) {
        const playerId = player.id;

        if (playerId === id) {
            return player;
        }
    }
}

/**
 * 指定されたイスをキルします
 * @param {Entity} chair 
 */
export function kill(chair) {
    try {
        for (const key of chairMap.keys()) {
            const data = chairMap.get(key);
            const entityName = data.entityName;

            if (chair.nameTag === entityName) {
                const player = getPlayer(key);

                chairMap.delete(key);
                chair.remove();
                player.sit = false;
            }
        }
    } catch { }
}

/**
 * 全てのイスをキルします
 */
export function killAll() {
    system.run(() => {
        const dimensionIds = ["overworld", "nether", "the_end"];

        for (const dimensionId of dimensionIds) {
            const dimension = world.getDimension(dimensionId);
            const chairs = dimension.getEntities({ type: "chair:chair" });

            for (const chair of chairs) {
                chairMap.clear();
                chair.remove();
            }
        }
    });
}