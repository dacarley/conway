module.exports = {
    loadFile
}

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

async function loadFile(evt) {
    const text = await readFile(evt.target.files[0]);
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
                            refreshDisplay();
                            return;

                        case char === "b":
                        case char === "o":
                            for (let i = 0; i < num; ++i) {
                                grid[(row * gridWidth) + col + i] = char === "o" ? 1 : 0;
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
                // if (x > gridWidth) {
                //     alert("Pattern is too wide");
                //     return;
                // }

                // if (y > gridHeight) {
                //     alert("Pattern is too tall");
                //     return;
                // }

                onClear();

                ready = true;
                break;
        }
    }
}