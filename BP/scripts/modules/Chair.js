import { Dimension, DimensionTypes, Entity, EntityComponentTypes, Player, system, world } from "@minecraft/server";

export default class Chair {
    /**
     * プレイヤーを座らせる
     * @param {Player} player 
     * @param {import("@minecraft/server").Vector3} location 
     */
    static sit(player, location) {
        const dimension = player.dimension;

        if (
            !this.canPlayerSit(player) ||
            !this.canSitAtLocation(dimension, player.location)
        ) return;

        // locationが未定義だった時、プレイヤーの座標を代入する
        // ブロックの高さに座席がくるように位置を調整する
        if (!location) location = { x: player.location.x, y: player.location.y - 0.13, z: player.location.z };
        else location = { x: location.x, y: location.y + 0.35, z: location.z };

        system.run(() => {
            // イスとなるエンティティを召喚する
            const chairEntity = dimension.spawnEntity("chair:chair", location);

            this.entityRide(chairEntity, player);

            /**
             * データを入れる
             * @type {ChairData}
             */
            const data = {
                playerId: player.id,
                location,
            };
            chairEntity.setDynamicProperty("data", JSON.stringify(data));

            // 座ったことを保存する
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
        return !!player.getDynamicProperty("sit");
    }

    /**
     * 指定された場所が座れる場所かをチェック
     * @param {Dimension} dimension 
     * @param {import("@minecraft/server").Vector3} location 
     * @returns {boolean}
     */
    static canSitAtLocation(dimension, location) {
        // 座ろうとしている座標の上が空気出ない時
        const upBlock = dimension.getBlock({ x: location.x, y: location.y + 1, z: location.z });
        if (!upBlock.isAir) return false;

        // 座ろうとしている座標の下が空気の時
        const downBlock = dimension.getBlock({ x: location.x, y: location.y - 1, z: location.z });
        if (downBlock.isAir) return false;

        return true;
    }

    /**
     * プレイヤーが座れる状態かをチェック
     * @param {Player} player 
     * @returns {boolean}
     */
    static canPlayerSit(player) {
        // 既に座っている時
        if (this.isSit(player)) return false;

        // スニークしている時
        if (player.isSneaking) return false;

        return true;
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

    /**
     * エンティティがエンティティに乗る
     * @param {Entity} entity 
     * @param {Entity} rider 
     */
    static entityRide(entity, rider) {
        try {
            const entityRideable = entity.getComponent(EntityComponentTypes.Rideable);

            if (entityRideable) {
                entityRideable.addRider(rider);
            }
        } catch { }
    }
}