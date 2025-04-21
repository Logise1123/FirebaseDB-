(function(Scratch) {
    "use strict";
    if (!Scratch.extensions.unsandboxed) throw new Error("FirebaseDB must run unsandboxed");

    class FirebaseDB {
        constructor() {
            this.api = "https://guessthepin-2fe64-default-rtdb.europe-west1.firebasedatabase.app/pin";
        }

        getInfo() {
            return {
                id: "FirebaseDB",
                name: "Firebase DB",
                color1: "#ff6600",
                blocks: [
                    {
                        opcode: "setKey",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "set [KEY] to [VALUE]",
                        arguments: {
                            KEY: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "key"
                            },
                            VALUE: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "value"
                            }
                        }
                    },
                    {
                        opcode: "getKey",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "get [KEY]",
                        arguments: {
                            KEY: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "key"
                            }
                        }
                    }
                ]
            };
        }

        async setKey(args) {
            const key = args.KEY;
            const value = args.VALUE;

            const delay = 500 + Math.random() * 500;
            await new Promise(resolve => setTimeout(resolve, delay));

            if (value.length > 8000) {
                return;
            }

            await fetch(`${this.api}/${encodeURIComponent(key)}.json`, {
                method: "PUT",
                body: JSON.stringify(value)
            });
        }

        async getKey(args) {
            const key = args.KEY;

            const delay = 500 + Math.random() * 500;
            await new Promise(resolve => setTimeout(resolve, delay));

            const res = await fetch(`${this.api}/${encodeURIComponent(key)}.json`);
            const data = await res.json();
            return data ?? "";
        }
    }

    Scratch.extensions.register(new FirebaseDB());
})(Scratch);
