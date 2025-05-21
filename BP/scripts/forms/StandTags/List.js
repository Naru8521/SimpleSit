import { Player, world } from "@minecraft/server";
import * as UI from "@minecraft/server-ui";
import SettingsMenuForm from "../SettingsMenu";
import { config } from "../../config";
import StandTagsAddForm from "./Add";
import StandTagsEditForm from "./Edit";

/**
 * @param {Player} player 
 */
export default async function StandTagsListForm(player) {
    /** @type {ChairSettings} */
    const { allowStandTags } = JSON.parse(world.getDynamicProperty(config.settingsDyId));
    const form = new UI.ActionFormData();

    form.title("Tag list allowed to stand");
    form.label("If empty, it is available to all players.");
    form.button("§lReturn");
    form.button("§lAdd tag");

    for (const allowTag of allowStandTags) {
        form.button(allowTag);
    }

    const { selection, canceled } = await form.show(player);

    if (canceled) return;
    if (selection === 0) return await SettingsMenuForm(player);
    if (selection === 1) return await StandTagsAddForm(player);

    await StandTagsEditForm(player, selection - 2);
}