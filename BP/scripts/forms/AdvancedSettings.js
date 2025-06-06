import { Player, world } from "@minecraft/server";
import * as UI from "@minecraft/server-ui";
import SitTagsListForm from "./SitTags/List";
import StandTagsListForm from "./StandTags/List";
import { config } from "../config";
import SettingsMenuForm from "./SettingsMenu";

/**
 * @param {Player} player 
 */
export default async function AdvancedSettingsForm(player) {
    /** @type {ChairSettings} */
    const settings = JSON.parse(world.getDynamicProperty(config.settingsDyId));
    const form = new UI.ModalFormData();

    form.title("%sit.form.title.text.advanced_settings");
    form.toggle("%sit.form.popup.text.advanced_settings.onlyStandCommand", {
        defaultValue: settings.forceStandByCommandOnly,
        tooltip: "%sit.form.popup.tooltip.text.advanced_settings.onlyStandCommand"
    });
    form.submitButton("§l%sit.form.buttons.text.save");

    const { formValues, canceled } = await form.show(player);

    if (canceled) return await SettingsMenuForm(player);

    settings.forceStandByCommandOnly = formValues[0];
    world.setDynamicProperty(config.settingsDyId, JSON.stringify(settings));
    await SettingsMenuForm(player);
}