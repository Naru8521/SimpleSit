import { Player, world } from "@minecraft/server";
import * as UI from "@minecraft/server-ui";
import SitTagsListForm from "./List";
import { config } from "../../config";

/**
 * @param {Player} player 
 */
export default async function SitTagsEditForm(player, selectIndex) {
    /** @type {ChairSettings} */
    const settings = JSON.parse(world.getDynamicProperty(config.settingsDyId));
    const form = new UI.ModalFormData();

    form.title("%sit.form.title.text.edittag");
    form.label("%sit.form.label.text.edit_allow_sit_tags");
    form.textField("%sit.form.popup.text.tag", "tag", {
        defaultValue: settings.allowSitTags[selectIndex],
    });
    form.toggle("%sit.form.popup.text.delete", {
        defaultValue: false
    });
    form.submitButton("§l%sit.form.buttons.text.save");

    const { formValues, canceled } = await form.show(player);

    if (canceled) return await SitTagsListForm(player);

    if (formValues[2]) {
        settings.allowSitTags.splice(selectIndex, 1);
        world.setDynamicProperty(config.settingsDyId, JSON.stringify(settings));
    } else {
        const newTag = (formValues[1] ?? "").trim();

        if (newTag) {
            settings.allowSitTags[selectIndex] = newTag;
            world.setDynamicProperty(config.settingsDyId, JSON.stringify(settings));
        }
    }

    await SitTagsListForm(player);
}