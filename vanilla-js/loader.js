import { Core } from "./core.js";
import { Render } from "./render.js";

export const Loader = {
    loadFile
};

function readFile(file) {
    return new Promise((resolve, reject) => {
        if (!file) {
            return reject(new Error("No file!"));
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            resolve(e.target.result);
        };

        reader.readAsText(file);
    });
}

async function loadFile(file) {
    const text = await readFile(file);
    const lines = text.split("\n");

    let ready = false;
    let row = 0;
    let col = 0;

    for (let line of lines) {
        switch (true) {
            case ready:
                let digits = "";
                let num = 1;

                for (let char of line) {
                    switch (true) {
                        case char === "!":
                            Render.refreshDisplay();
                            return;

                        case char === "b":
                        case char === "o":
                            for (let i = 0; i < num; ++i) {
                                Core.grid[(row * Core.gridWidth) + col + i] = char === "o" ? 1 : 0;
                            }
                            col += num;
                            digits = "";
                            num = 1;
                            break;

                        case char === "$":
                            ++row;
                            col = 0;
                            break;

                        case char >= "0" && char <= "9":
                            digits = `${digits}${char}`;
                            num = Number(digits);
                            break;
                    }
                }
                break;

            case line.startsWith("#"):
                // Ignore meta lines
                break;

            case line.startsWith("x = "):
                // Only process the "standard" header line
                // const [, x, y] = line.match(/x = (\d+), y = (\d+), rule = .*/)
                // if (x > Core.gridWidth) {
                //     alert("Pattern is too wide");
                //     return;
                // }

                // if (y > Core.gridHeight) {
                //     alert("Pattern is too tall");
                //     return;
                // }

                Core.clear();

                ready = true;
                break;
        }
    }
}