import { Dimension, Entity, Player, system, world } from "@minecraft/server";

export class Chair {
    /**
     * @param {Player} player 
     */
    constructor(player) {
        /** @type {Player} */
        this.player = player;

        /** @type {import("@minecraft/server").Vector3} */
        this.location = null;

        /** @type {Dimension} */
        this.dimension = player.dimension;

        /** @type {Entity} */
        this.chair = null;

        /** @type {number} */
        this.intervalId = null;

        this.leaveEvent = null;
        this.removeEvent = null;
    }

    /** イスに座ります */
    sit(location) {
        const { x, y, z } = this.player.location;
        const dimension = this.player.dimension;
        const downblock = dimension.getBlock({ x: x, y: y - 1, z: z });
        const upblock = dimension.getBlock({ x: x, y: y + 1, z: z });

        if (this.player.sit) return;
        if (this.player.isSneaking) return;
        if (!upblock.isAir) return;
        if (downblock.isAir) return;
        if (y > Math.floor(y)) {
            this.location = { x: x, y: y - 0.13, z: z };
        } else {
            this.location = { x: x, y: downblock.y + 0.8, z: z };
        }
        if (location) this.location = location;

        system.run(() => {
            const playerId = this.player.id;
            const chair = this.dimension.spawnEntity("chair:chair", this.location);

            chair.nameTag = `chair_${playerId}`;
            chair.getComponent("rideable").addRider(this.player);
            this.chair = chair;
            this.intervalId = system.runInterval(() => {
                this.teleport();
            });

            this.leaveEvent = world.beforeEvents.playerLeave.subscribe(ev => {
                const { player } = ev;

                if (player.id === this.player.id) {
                    this.kill();
                }
            });

            this.removeEvent = world.beforeEvents.entityRemove.subscribe(ev => {
                const { removedEntity } = ev;

                if (removedEntity.id === this.chair.id) {
                    this.kill();
                }
            });
        });
    }

    /** テレポート */
    teleport() {
        const rotation = this.player.getRotation();
        const chairLocation = {
            x: Math.floor(this.location.x),
            y: Math.floor(this.location.y),
            z: Math.floor(this.location.z)
        };

        if (!this.chair.isValid()) return this.kill();

        this.chair.teleport(this.location, { dimension: this.dimension });
        this.chair.setRotation(rotation);

        if (this.dimension.getBlock(chairLocation).isAir) {
            this.kill();
            return;
        }

        if (!this.player.hasComponent("riding")) {
            this.kill();
        }
    }

    /** イスから降ります */
    out() {
        this.player.teleport({
            x: this.location.x,
            y: this.location.y,
            z: this.location.z
        }, { dimension: this.dimension });
        this.kill();
    }

    /** イスをキルします */
    kill() {
        this.player.sit = false;
        system.run(() => {
            this.evKill();

            try {
                this.chair.remove();
            } catch {}
        });
    }

    /** イベントをキルします */
    evKill() {
        world.beforeEvents.playerLeave.unsubscribe(this.leaveEvent);
        world.beforeEvents.entityRemove.unsubscribe(this.removeEvent);
        system.clearRun(this.intervalId);
    }
}

system.run(() => {
    const dimensionIds = ["overworld", "nether", "the_end"];

    for (const dimensionId of dimensionIds) {
        const dimension = world.getDimension(dimensionId);
        const chairs = dimension.getEntities({ type: "chair:chair" });

        for (const chair of chairs) {
            chair.remove();
        }
    }
});