import { Player, world } from "@minecraft/server";
import * as UI from "@minecraft/server-ui";
import { config } from "../../config";
import StandTagsListForm from "./List";

/**
 * @param {Player} player 
 */
export default async function StandTagsAddForm(player) {
    /** @type {ChairSettings} */
    const settings = JSON.parse(world.getDynamicProperty(config.settingsDyId));
    const form = new UI.ModalFormData();

    form.title("Add tag");
    form.label("Add tags that are allowed to stand.");
    form.textField("tag", "tag", {
        defaultValue: ""
    });
    form.submitButton("§lAdd");

    const { formValues, canceled } = await form.show(player);

    if (canceled) return await StandTagsListForm(player);

    const newTag = (formValues[1] ?? "").trim();

    if (newTag) {
        settings.allowStandTags.push(newTag);
        world.setDynamicProperty(config.settingsDyId, JSON.stringify(settings));
    }

    await StandTagsListForm(player);
}