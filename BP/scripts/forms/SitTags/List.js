import { Player, world } from "@minecraft/server";
import * as UI from "@minecraft/server-ui";
import SettingsMenuForm from "../SettingsMenu";
import { config } from "../../config";
import SitTagsAddForm from "./Add";
import SitTagsEditForm from "./Edit";

/**
 * @param {Player} player 
 */
export default async function SitTagsListForm(player) {
    /** @type {ChairSettings} */
    const { allowSitTags } = JSON.parse(world.getDynamicProperty(config.settingsDyId));
    const form = new UI.ActionFormData();

    form.title("Tag list allowed to sit");
    form.label("If empty, it is available to all players.");
    form.button("§lReturn");
    form.button("§lAdd tag");

    for (const allowTag of allowSitTags) {
        form.button(allowTag);
    }

    const { selection, canceled } = await form.show(player);

    if (canceled) return;
    if (selection === 0) return await SettingsMenuForm(player);
    if (selection === 1) return await SitTagsAddForm(player);

    SitTagsEditForm(player, selection - 2);
}