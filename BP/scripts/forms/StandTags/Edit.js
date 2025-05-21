import { Player, world } from "@minecraft/server";
import * as UI from "@minecraft/server-ui";
import { config } from "../../config";
import StandTagsListForm from "./List";

/**
 * @param {Player} player 
 */
export default async function StandTagsEditForm(player, selectIndex) {
    /** @type {ChairSettings} */
    const settings = JSON.parse(world.getDynamicProperty(config.settingsDyId));
    const form = new UI.ModalFormData();

    form.title("Edit tag");
    form.label("Edit tags that are allowed to stand.");
    form.textField("tag", "tag", {
        defaultValue: settings.allowStandTags[selectIndex]
    });
    form.toggle("delete", {
        defaultValue: false
    });
    form.submitButton("§lSave");

    const { formValues, canceled } = await form.show(player);

    if (canceled) return await StandTagsListForm(player);

    if (formValues[2]) {
        settings.allowStandTags.splice(selectIndex, 1);
        world.setDynamicProperty(config.settingsDyId, JSON.stringify(settings));
    } else {
        const newTag = (formValues[1] ?? "").trim();

        if (newTag) {
            settings.allowStandTags[selectIndex] = newTag;
            world.setDynamicProperty(config.settingsDyId, JSON.stringify(settings));
        }
    }

    await StandTagsListForm(player);
}