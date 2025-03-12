import { ChatSendBeforeEvent, ScriptEventCommandMessageAfterEvent, system, world, Player, Entity, Block } from "@minecraft/server";

/**
 * @typedef {Object} CommandOptions
 * @property {string[]?} prefixes - Command prefixes
 * @property {string[]?} ids - Command ids
 * @property {string[]?} tags - Command Permission（必要なタグ）
 * @property {string} name - Command name
 * @property {string?} description - Command description
 * @property {CommandArgument[]} [args] - List of command arguments
 */

/**
 * @typedef {Object} CommandArgument
 * @property {string} name - Argument name
 * @property {string[]?} tags - Command Permission 
 * @property {"string" | "number" | "boolean"} [type] - Argument type
 * @property {CommandArgument[]} [args] - Nested arguments
 */

/**
 * @typedef {Object} ParsedCommandArgs
 * @property {string | number | boolean | ParsedCommandArgs} [key] 
 */

/**
 * @callback OnCommandHandler 
 * @param {ParsedCommandArgs} args 
 * @param {Player} player
 */

/**
 * @callback OnScriptCommandHandler 
 * @param {ParsedCommandArgs} args 
 * @param {Entity?} initiator 
 * @param {Entity?} sourceEntity
 * @param {Block?} sourceBlock
 */

/**
 * @callback OnCommandErrorHandler 
 * @param {Player?} player 
 * @param {Entity?} initiator 
 * @param {Entity?} entity 
 * @param {Block?} block 
 * @param {ErrorType} errorType 
 * @param {string} message 
 * @param {extra?} any 
 */

/**
 * @typedef {Object} ErrorType 
 * @property {"Tag"} TAG 
 * @property {"Arguments"} ARGS 
 * @property {"Unknown"} UNKNOWN
 */

/** @type {ErrorType} */
export const ErrorType = {
    TAG: "Tag",         // タグによる権限エラー
    ARGS: "Arguments",  // 引数の不正
    UNKNOWN: "Unknown"  // その他
};

class Command {
    /**
     * @param {string[]} prefixes
     * @param {string[]} ids 
     * @param {string} name
     * @param {string} description
     * @param {CommandArgument[]} args
     * @param {string[]} tags
     */
    constructor(prefixes, ids, name, description, args, tags) {
        this.prefixes = prefixes;
        this.ids = ids;
        this.name = name;
        this.description = description;
        this.args = args || [];
        this.tags = tags || [];
        this.onCommandHandler = null;
        this.onScriptCommandHandler = null;
        /** 内部で利用するエラーハンドラ */
        this._onCommandError = null;
    }

    /**
     * エラー発生時の内部処理
     * @param {string} errorType 
     * @param {string} message 
     * @param {any} [extra]
     */
    _error(player, initiator, entity, block, errorType, message, extra) {
        if (this._onCommandError) {
            this._onCommandError(player, initiator, entity, block, errorType, message, extra);
        } else {
            console.error(message, extra);
        }
    }

    /**
     * コマンド実行時のハンドラを設定する
     * @param {OnCommandHandler} onCommandHandler
     */
    onCommand(onCommandHandler) {
        this.onCommandHandler = onCommandHandler;
    }

    /**
     * スクリプトコマンド実行時のハンドラを設定する
     * @param {OnScriptCommandHandler} onScriptCommandHandler 
     */
    onScriptCommand(onScriptCommandHandler) {
        this.onScriptCommandHandler = onScriptCommandHandler;
    }

    /**
     * エラー発生時のコールバックを設定する
     * @param {OnCommandErrorHandler} onCommandErrorHandler 
     */
    onCommandError(onCommandErrorHandler) {
        this._onCommandError = onCommandErrorHandler;
    }

    /**
     * @param {Player?} player 
     * @param {Entity?} initiator 
     * @param {Entity?} entity
     * @param {Block?} block 
     * @param {string[]} rawArgs
     * @param {CommandArgument[]} argDefs
     * @returns {{parsedArgs: ParsedCommandArgs, valid: boolean}}
     */
    parseArgs(player, initiator, entity, block, rawArgs, argDefs) {
        const parsedArgs = {};

        if (argDefs.length === 0) {
            if (rawArgs.length === 0) {
                return { parsedArgs, valid: true };
            } else {
                this._error(player, initiator, entity, block, ErrorType.ARGS, `このコマンドは引数を受け付けませんが、余分な引数が渡されました。`);
                return { parsedArgs, valid: false };
            }
        }

        const commandName = rawArgs.shift();
        const matchedArg = argDefs.find(arg => arg.name === commandName);

        if (!matchedArg) {
            this._error(player, initiator, entity, block, ErrorType.ARGS, `不正な引数: ${commandName}`);
            return { parsedArgs: {}, valid: false };
        }

        if (matchedArg.args && matchedArg.args.length > 0) {
            parsedArgs[matchedArg.name] = {};

            if (rawArgs.length !== matchedArg.args.length) {
                this._error(player, initiator, entity, block, ErrorType.ARGS, `Incorrect number of arguments for ${matchedArg.name} (required: ${matchedArg.args.length}, received: ${rawArgs.length})`);
                return { parsedArgs: {}, valid: false };
            }

            for (const argDef of matchedArg.args) {
                let value = rawArgs.shift();

                if (argDef.type === "number") {
                    value = Number(value);
                    if (Number.isNaN(value)) {
                        this._error(player, initiator, entity, block, ErrorType.ARGS, `Error parsing number: ${argDef.name}`);
                        return { parsedArgs: {}, valid: false };
                    }
                } else if (argDef.type === "boolean") {
                    if (value !== "true" && value !== "false") {
                        this._error(player, initiator, entity, block, ErrorType.ARGS, `Error parsing Boolean: ${argDef.name}`);
                        return { parsedArgs: {}, valid: false };
                    }
                    value = value === "true";
                }

                parsedArgs[matchedArg.name][argDef.name] = value;
            }
        } else if (rawArgs.length > 0) {
            this._error(player, initiator, entity, block, ErrorType.ARGS, `${matchedArg.name} has no arguments but has extra arguments`);
            return { parsedArgs: {}, valid: false };
        }

        return { parsedArgs, valid: true };
    }

    /**
     * チャットコマンドを実行する
     * @param {string[]} rawArgs
     * @param {Player} sender
     * @returns {boolean} 
     */
    executeCommand(rawArgs, sender) {
        // タグのチェック：コマンドに必要なタグが設定されている場合、プレイヤーがいずれかを持っているか確認する
        if (this.tags.length > 0) {
            let allowed = false;
            
            for (const tag of this.tags) {
                if (sender.hasTag(tag)) {
                    allowed = true;
                    break;
                }
            }

            if (!allowed) {
                this._error(sender, undefined, undefined, undefined, ErrorType.TAG, `プレイヤーはこのコマンドを実行する権限がありません。（必要なタグ: ${this.tags.join(", ")}）`);
                return false;
            }
        }

        if (!this.onCommandHandler) return false;

        const { parsedArgs, valid } = this.parseArgs(sender, undefined, undefined, undefined, rawArgs, this.args);
        if (!valid) {
            return false;
        }

        this.onCommandHandler(parsedArgs, sender);
        return true;
    }

    /**
     * スクリプトコマンドを実行する
     * @param {string[]} rawArgs 
     * @param {Entity} initiator 
     * @param {Entity} sourceEntity 
     * @param {Block} sourceBlock 
     * @returns {boolean}
     */
    executeScriptCommand(rawArgs, initiator, sourceEntity, sourceBlock) {
        // initiatorがプレイヤーであればタグのチェックを実施
        if (this.tags.length > 0 && initiator && typeof initiator.hasTag === "function") {
            let allowed = false;
            for (const tag of this.tags) {
                if (initiator.hasTag(tag)) {
                    allowed = true;
                    break;
                }
            }
            if (!allowed) {
                this._error(undefined, initiator, sourceEntity, sourceBlock, ErrorType.TAG, `実行者はこのコマンドを実行する権限がありません。（必要なタグ: ${this.tags.join(", ")}）`);
                return false;
            }
        }

        if (!this.onScriptCommandHandler) return false;

        const { parsedArgs, valid } = this.parseArgs(undefined, initiator, sourceEntity, sourceBlock, rawArgs, this.args);
        if (!valid) {
            return false;
        }

        this.onScriptCommandHandler(parsedArgs, initiator, sourceEntity, sourceBlock);
        return true;
    }
}

class CommandManager {
    constructor() {
        this.commands = new Map();
        // CommandManager側のエラーハンドラは各コマンドへ伝播させます
        this._onCommandError = null;

        world.beforeEvents.chatSend.subscribe(ev => {
            handleChatCommand(ev, this.commands);
        });
        system.afterEvents.scriptEventReceive.subscribe(ev => {
            handleScriptEventCommand(ev, this.commands);
        });
    }

    /**
     * @param {CommandOptions} options
     * @returns {Command}
     */
    register({ prefixes = [], ids = [], tags = [], name, description = "", args }) {
        if (prefixes.length === 0 && ids.length === 0) {
            throw new Error("prefixes or ids are not defined");
        }
        if (!name || name.trim() === "") {
            throw new Error("name is not defined.");
        }

        const command = new Command(prefixes, ids, name, description, args, tags);
        // CommandManager に設定されたエラーハンドラを各コマンドに伝播
        command.onCommandError(this._onCommandError);

        prefixes.forEach(prefix => {
            this.commands.set(`${prefix}${name}`, command);
        });
        ids.forEach(id => {
            this.commands.set(id, command);
        });
        return command;
    }

    /**
     * @returns {CommandOptions[]}
     */
    getCommands() {
        return [...this.commands.values()];
    }

    /**
     * エラー発生時のコールバックを登録する
     * @param {(errorType: string, message: string, extra?: any) => void} callback 
     */
    onCommandError(callback) {
        this._onCommandError = callback;
    }
}

/**
 * チャット送信前のイベントでコマンドを処理する
 * @param {ChatSendBeforeEvent} ev 
 * @param {Map<string, Command>} commands 
 */
function handleChatCommand(ev, commands) {
    const { sender, message } = ev;
    const args = message.trim().split(/\s+/);
    const commandKey = args.shift();

    if (commands.has(commandKey)) {
        const command = commands.get(commandKey);
        const executed = command.executeCommand(args, sender);

        if (executed) ev.cancel = true;
    }
}

/**
 * スクリプトイベントでのコマンドを処理する
 * @param {ScriptEventCommandMessageAfterEvent} ev 
 * @param {Map<string, Command>} commands 
 */
function handleScriptEventCommand(ev, commands) {
    const { id, message, initiator, sourceEntity, sourceBlock } = ev;
    const args = message.trim().split(/\s+/);

    if (commands.has(id)) {
        const command = commands.get(id);

        command.executeScriptCommand(args, initiator, sourceEntity, sourceBlock);
    }
}

const commandManager = new CommandManager();
export default commandManager;
