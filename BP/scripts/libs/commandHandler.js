import { ChatSendAfterEvent, ChatSendBeforeEvent, Player, ScriptEventCommandMessageAfterEvent, world } from "@minecraft/server";

/**
 * @typedef {string} CommandsPath 
 */

/**
 * @typedef {Object} CommandSetting
 * @property {string[]} prefixs
 * @property {string[]} ids
 */

/**
 * @typedef {Command[]} Commands
 */

/**
 * @typedef {SubCommand} Command 
 */

/**
 * @typedef {Object} SubCommand 
 * @property {string} name
 * @property {string?} tags
 * @property {SubCommand[]?} subCommands
 */

export default class CommandHandler {
    /**
     * @param {CommandsPath} commandsPath 
     * @param {CommandSetting} commandSetting 
     * @param {Commands} commands 
     * @param {boolean} log 
     */
    constructor(commandsPath, commandSetting, commands, log = false) {
        this.commandsPath = commandsPath;
        this.commandSetting = commandSetting;
        this.commands = commands;
        this.log = log;

        const strings = getCommandStrings(this.commands);
        const paths = getCommandPaths(this.commands, this.commandsPath);

        // 存在の確認
        (async () => {
            for (let i = 0; i < strings.length; i++) {
                try {
                    await import(paths[i]);

                    if (log) {
                        console.log(`${strings[i]} がコマンドとして登録されました。`);
                    }
                } catch (e) {
                    console.error(e);
                }
            }
        })();
    }

    /**
     * コマンドかどうか
     * @param {ChatSendBeforeEvent | ChatSendAfterEvent | ScriptEventCommandMessageAfterEvent} ev 
     */
    isCommand(ev) {
        return getCommandDetails(this.commandsPath, this.commandSetting, this.commands, ev) ? true : false;
    }

    /**
     * コマンドを実行
     * @param {ChatSendBeforeEvent | ChatSendAfterEvent | ScriptEventCommandMessageAfterEvent} ev 
     * @param {boolean} cancel - ChatSendBeforeの時のみ (初期値はtrue)
     */
    handleCommand(ev, cancel = true) {
        const details = getCommandDetails(this.commandsPath, this.commandSetting, this.commands, ev);

        if (details) {
            const { path, remaining } = details;

            if (ev instanceof ChatSendBeforeEvent) {
                ev.cancel = cancel;
            }

            (async () => {
                try {
                    const module = await import(path);

                    if (ev instanceof ChatSendBeforeEvent | ChatSendAfterEvent) {
                        module.run(remaining, { player: ev.sender });
                    } else {
                        module.run(remaining, { player: ev.sourceEntity instanceof Player ? ev.sourceEntity : undefined, entity: ev.sourceEntity, initiator: ev.initiator, block: ev.sourceBlock });
                    }
                } catch (e) {
                    console.error(e);
                }
            })();
        }
    }
}

/**
 * @param {CommandsPath} commandsPath
 * @param {CommandSetting} commandSetting 
 * @param {Commands} commands 
 * @param {ChatSendBeforeEvent | ChatSendAfterEvent | ScriptEventCommandMessageAfterEvent} ev 
 * @returns {{ path: string, remaining: string[] } | undefined}
 */
function getCommandDetails(commandsPath, commandSetting, commands, ev) {
    const commandPaths = getCommandPaths(commands, commandsPath);
    const commandStrings = getCommandStrings(commands);

    if (ev instanceof ChatSendBeforeEvent || ev instanceof ChatSendAfterEvent) {
        let { message, sender } = ev;

        if (!commandSetting.prefixs || commandSetting.prefixs.length === 0) return undefined;

        for (const prefix of commandSetting.prefixs) {
            if (message.startsWith(prefix)) {
                message = message.replace(prefix, "").trim();

                const parts = message.split(" ");

                for (let i = 0; i < commandPaths.length; i++) {
                    const commandParts = commandStrings[i].split(" ");

                    if (parts.length >= commandParts.length && parts.slice(0, commandParts.length).every((part, index) => part === commandParts[index])) {
                        const remaining = parts.slice(commandParts.length);

                        if (Array.isArray(commands[i].tags) && commands[i].tags.length > 0) {
                            const commandTags = commands[i].tags;

                            if (!sender.getTags().some(tag => commandTags.includes(tag))) {
                                return undefined;
                            }
                        }

                        if (commands[i].subCommands && commands[i].subCommands.length > 0) {
                            for (const subCommand of commands[i].subCommands) {
                                const subCommandTags = subCommand.tags || [];

                                if (subCommandTags.length > 0 && !sender.getTags().some(tag => subCommandTags.includes(tag))) {
                                    continue;
                                }

                                const remainingSubCommand = parts.slice(commandParts.length);
                                return { path: commandPaths[i], remaining: remainingSubCommand };
                            }
                        }

                        return { path: commandPaths[i], remaining };
                    }
                }
            }
        }
    } else {
        const { id, message } = ev;

        if (!commandSetting.ids || commandSetting.ids.length === 0) return undefined;

        for (const ida of commandSetting.ids) {
            if (id === ida) {
                const parts = message.split(" ");

                for (let i = 0; i < commandPaths.length; i++) {
                    const commandParts = commandStrings[i].split(" ");

                    if (parts.length >= commandParts.length && parts.slice(0, commandParts.length).every((part, index) => part === commandParts[index])) {
                        const remaining = parts.slice(commandParts.length);

                        return { path: commandPaths[i], remaining };
                    }
                }
            }
        }
    }

    return undefined;
}

/**
 * @param {Commands} commands 
 * @param {string} currentPath 
 * @returns {string[]}
 */
function getCommandPaths(commands, currentPath = "") {
    const paths = [];

    for (const command of commands) {
        const newPath = currentPath ? `${currentPath}/${command.name}` : command.name;

        if (!command.subCommands || command.subCommands.length === 0) {
            paths.push(newPath);
        } else {
            paths.push(...getCommandPaths(command.subCommands, newPath));
        }
    }

    return paths;
}

/**
 * @param {Commands} commands 
 * @param {string} currentString 
 * @returns {string[]}
 */
function getCommandStrings(commands, currentString = "") {
    const strings = [];

    for (const command of commands) {
        const newString = currentString ? `${currentString} ${command.name}` : command.name;

        if (!command.subCommands || command.subCommands.length === 0) {
            strings.push(newString);
        } else {
            strings.push(...getCommandStrings(command.subCommands, newString));
        }
    }

    return strings;
}