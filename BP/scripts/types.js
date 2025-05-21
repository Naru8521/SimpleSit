/**
 * @typedef {Object} ChairData 
 * @property {string} playerId 
 * @property {import("@minecraft/server").Vector3} location 
 */

/**
 * @typedef {Object} ChairSettings 
 * @prop {string[]} allowSitTags プレイヤーが座るのを許可されているタグ一覧
 * @prop {string[]} allowStandTags プレイヤーが立つのを許可されているタグ一覧
 * @prop {boolean} forceStandByCommandOnly trueならコマンド以外で立てなくする
 */