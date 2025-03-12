import { config } from "../config";
import commandManager, { ErrorType } from "../modules/CommandManager";
import { Chair } from "../modules/Chair";

export function loadStandAllCommand() {
    const standAllCommand = commandManager.register({
        prefixes: config.command.prefixes,
        ids: config.command.ids,
        tags: config.command.tags,
        name: "standAll",
        description: "全てのプレイヤーを立たせる"
    });

    console.log("load standAll command.");
    
    standAllCommand.onCommand((args, player) => {
        Chair.standAll();
    });

    standAllCommand.onCommandError((player, initiator, entity, block, errorType, message, extra) => {
        if (errorType === ErrorType.TAG) {
            player.sendMessage("§cエラー: このコマンドを実行する権限が付与されていません。");
        }
    });
}