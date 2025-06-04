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

    form.title("%sit.form.title.text.allow_sit_tags");
    form.label("%sit.form.label.text.allow_sit_tags");
    form.button("§l%sit.form.buttons.text.return");
    form.button("§l%sit.form.buttons.text.addtag");

    for (const allowTag of allowSitTags) {
        form.button(allowTag);
    }

    const { selection, canceled } = await form.show(player);

    if (canceled) return;
    if (selection === 0) return await SettingsMenuForm(player);
    if (selection === 1) return await SitTagsAddForm(player);

    SitTagsEditForm(player, selection - 2);
}