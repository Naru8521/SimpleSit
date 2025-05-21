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

    form.title("Add tag");
    form.label("Add tags that are allowed to sit.");
    form.textField("tag", "tag", {
        defaultValue: "",
    });
    form.submitButton("§lAdd");

    const { formValues, canceled } = await form.show(player);

    if (canceled) return await SitTagsListForm(player);

    const newTag = (formValues[1] ?? "").trim();

    if (newTag) {
        settings.allowSitTags.push(newTag);
        world.setDynamicProperty(config.settingsDyId, JSON.stringify(settings));
    }

    await SitTagsListForm(player);
}