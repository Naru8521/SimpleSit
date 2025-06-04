import { Player, world } from "@minecraft/server";
import * as UI from "@minecraft/server-ui";
import SitTagsListForm from "./List";
import { config } from "../../config";

/**
 * @param {Player} player 
 */
export default async function SitTagsAddForm(player) {
    /** @type {ChairSettings} */
    const settings = JSON.parse(world.getDynamicProperty(config.settingsDyId));
    const form = new UI.ModalFormData();

    form.title("%sit.form.title.text.addtag");
    form.label("%sit.form.label.text.add_allow_sit_tags");
    form.textField("%sit.form.popup.text.tag", "tag", {
        defaultValue: "",
    });
    form.submitButton("§l%sit.form.buttons.text.add");

    const { formValues, canceled } = await form.show(player);

    if (canceled) return await SitTagsListForm(player);

    const newTag = (formValues[1] ?? "").trim();

    if (newTag) {
        settings.allowSitTags.push(newTag);
        world.setDynamicProperty(config.settingsDyId, JSON.stringify(settings));
    }

    await SitTagsListForm(player);
}