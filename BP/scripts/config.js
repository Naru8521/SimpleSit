/** @type {import("./libs/commandHandler").CommandConfig} */
export const commandConfig = {
    path: "../commands",

    setting: {
        prefix: "",
        id: ""
    },

    commands: [
        {
            name: "sit",
            description: "イスに座ります"
        },
        {
            name: "coff",
            description: "イスから強制的に降ります"
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