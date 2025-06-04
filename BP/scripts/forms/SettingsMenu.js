import { Player} from "@minecraft/server";
import * as UI from "@minecraft/server-ui";
import SitTagsListForm from "./SitTags/List";
import StandTagsListForm from "./StandTags/List";
import AdvancedSettingsForm from "./AdvancedSettings";

/**
 * @param {Player} player 
 */
export default async function SettingsMenuForm(player) {
    const form = new UI.ActionFormData();

    form.title("%sit.form.title.text.settings");
    form.button("§l%sit.form.buttons.text.settings.allow_sit_tags");
    form.button("§l%sit.form.buttons.text.settings.allow_stand_tags");
    form.button("§l%sit.form.buttons.text.settings.advanced_settings");

    const { selection, canceled } = await form.show(player);

    if (canceled) return;
    if (selection === 0) return await SitTagsListForm(player);
    if (selection === 1) return await StandTagsListForm(player);
    if (selection === 2) return await AdvancedSettingsForm(player);
}