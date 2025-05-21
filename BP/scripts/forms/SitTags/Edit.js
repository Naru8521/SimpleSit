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

    form.title("Edit tag");
    form.label("Edit tags that are allowed to sit.");
    form.textField("tag", "tag", {
        defaultValue: settings.allowSitTags[selectIndex],
    });
    form.toggle("delete", {
        defaultValue: false
    });
    form.submitButton("§lSave");

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