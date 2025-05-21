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

    form.title("Chair settings");
    form.button("§lAllow sit tags");
    form.button("§lAllow stand tags");
    form.button("§lAdvanced settings");

    const { selection, canceled } = await form.show(player);

    if (canceled) return;
    if (selection === 0) return await SitTagsListForm(player);
    if (selection === 1) return await StandTagsListForm(player);
    if (selection === 2) return await AdvancedSettingsForm(player);
}