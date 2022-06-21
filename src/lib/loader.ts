function readFile(file: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        if (!file) {
            return reject(new Error("No file!"));
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            resolve(e?.target?.result as string);
        };

        reader.readAsText(file);
    });
}

type LoadFileResult = {
    grid: SharedArrayBuffer;
    width: number;
    height: number;
}

export async function loadFile(file: Blob): Promise<LoadFileResult> {
    const text = await readFile(file);
    const lines = text.split("\n");

    let ready = false;
    let row = 0;
    let col = 0;

    const result = {
    } as LoadFileResult;

    let buffer!: Uint8Array;

    for (let line of lines) {
        switch (true) {
            case ready:
                let digits = "";
                let num = 1;

                for (let char of line) {
                    switch (true) {
                        case char === "!":
                            return result;

                        case char === "b":
                        case char === "o":
                            for (let i = 0; i < num; ++i) {
                                buffer[row * result.width + col + i] = char === "o" ? 1 : 0;
                            }
                            col += num;
                            digits = "";
                            num = 1;
                            break;

                        case char === "$":
                            digits = "";
                            row += num;
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
                const match = line.match(/x = (\d+), y = (\d+), rule = .*/)
                if (!match) {
                    throw new Error("failed to parse dimensions");
                }

                const [, x, y] = match;

                result.width = Math.floor(Number(x) * 1.0);
                result.height = Math.floor(Number(y) * 1.0);
                result.grid = new SharedArrayBuffer(result.width * result.height);
                buffer = new Uint8Array(result.grid);

                ready = true;
                break;
        }
    }

    return result;
}