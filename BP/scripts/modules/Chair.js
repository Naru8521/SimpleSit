import { DimensionTypes, Entity, Player, system, world } from "@minecraft/server";

export class Chair {
    /**
     * プレイヤーを座らせる
     * @param {Player} player 
     * @param {import("@minecraft/server").Vector3} location 
     */
    static sit(player, location) {
        system.run(() => {
            const dimension = player.dimension;
            const copyLocation = location ? {...location} : player.location;

            // locationが未定義だった時、プレイヤーの座標を代入する
            // ブロックの高さに座席がくるように位置を調整する
            if (!location) location = { x: player.location.x, y: player.location.y - 0.13, z: player.location.z };
            else location = { x: location.x, y: location.y + 0.35, z: location.z };

            // 既に座っている時、立たせる
            if (this.isSit(player)) this.stand(player);

            // スニークしている時
            if (player.isSneaking) return;

            // 座ろうとしている座標の上が空気出ない時
            const upBlock = dimension.getBlock({ x: copyLocation.x, y: copyLocation.y + 1, z: copyLocation.z });
            if (!upBlock.isAir) return;

            // 座ろうとしている座標の下が空気の時
            const downBlock = dimension.getBlock({ x: copyLocation.x, y: copyLocation.y - 1, z: copyLocation.z });
            if (downBlock.isAir) return;

            // イスとなるエンティティを召喚する
            const chairEntity = dimension.spawnEntity("chair:chair", location);
            const chairRideable = chairEntity.getComponent("rideable");

            // プレイヤーを座らせる
            chairRideable.addRider(player);

            /**
             * データを入れる
             * @type {ChairData}
             */
            const data = {
                playerId: player.id,
                location,
            };
            chairEntity.setDynamicProperty("data", JSON.stringify(data));

            // 座ったことを知らせる
            player.setDynamicProperty("sit", true);
        });
    }

    /**
     * 特定の座っているプレイヤーを立たせる
     * @param {Player} player 
     */
    static stand(player) {
        system.run(() => {
            // 座っていない時
            if (!this.isSit(player)) return;

            // 紐づけされているイスのエンティティを取得する
            const chairEntity = this.getChair(player);

            // エンティティが存在する場合、削除する
            if (chairEntity) chairEntity.remove();

            // 立ったことを知らせる
            player.setDynamicProperty("sit", false);
        });
    }

    /**
     * 全てのプレイヤーを立たせる
     */
    static standAll() {
        const players = world.getAllPlayers();

        for (const player of players) {
            this.stand(player);
        }

        system.runTimeout(() => {
            const chairEntities = this.getAllChairs();

            for (const chairEntity of chairEntities) {
                chairEntity.remove();
            }
        });
    }

    /**
     * プレイヤーが座っているかを確認する
     * @param {Player} player 
     * @returns {boolean}
     */
    static isSit(player) {
        return player.getDynamicProperty("sit");
    }

    /**
     * プレイヤーが座っているエンティティを取得する
     * @param {Player} player 
     * @returns {Entity | null}
     */
    static getChair(player) {
        if (!this.isSit(player)) return null;

        const chairEntities = this.getAllChairs();

        for (const chairEntity of chairEntities) {
            /** @type {ChairData} */
            const data = JSON.parse(chairEntity.getDynamicProperty("data"));

            if (data.playerId === player.id) return chairEntity;
        }

        return null;
    }

    /**
     * 全てのエンティティを取得する
     * @returns {Entity[]}
     */
    static getAllChairs() {
        const dimensionIds = DimensionTypes.getAll().map(dimensionType => dimensionType.typeId);
        const chairs = [];

        for (const dimensionId of dimensionIds) {
            const dimension = world.getDimension(dimensionId);
            const chairEntities = dimension.getEntities({ type: "chair:chair" });

            chairs.push(chairEntities);
        }

        return chairs.flat();
    }
}