/** @type {import("./libs/commandHandler").CommandConfig} */
export const commandConfig = {
    path: "../commands",

    setting: {
        prefix: "",
        id: ""
    },

    commands: [
        {
            name: "sit"
        },
        {
            name: "coff"
        }
    ]
}

export const selectBlocks = [
    "stairs",
    "slab",
    "slab2",
    "slab3",
    "slab4"
]