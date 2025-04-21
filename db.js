(function(Scratch) {
    "use strict";
    if (!Scratch.extensions.unsandboxed) throw new Error("FirebaseDB must run unsandboxed");

    class FirebaseDB {
        constructor() {
            this.api = "https://guessthepin-2fe64-default-rtdb.europe-west1.firebasedatabase.app/pin"; // URL de la base de datos
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
                            KEY: { type: Scratch.ArgumentType.STRING, defaultValue: "key" },
                            VALUE: { type: Scratch.ArgumentType.STRING, defaultValue: "value" }
                        }
                    },
                    {
                        opcode: "getKey",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "get [KEY]",
                        arguments: {
                            KEY: { type: Scratch.ArgumentType.STRING, defaultValue: "key" }
                        }
                    }
                ]
            };
        }

        // Bloque 'set x to y' - Guardar valor
        setKey({ KEY, VALUE }) {
            fetch(`${this.api}/${encodeURIComponent(KEY)}.json`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(VALUE)
            });
        }

        // Bloque 'get x' - Obtener valor
        async getKey({ KEY }) {
            try {
                const response = await fetch(`${this.api}/${encodeURIComponent(KEY)}.json`);
                const data = await response.json();
                return data || ""; // Devuelve el valor de la clave o un string vacío si no existe
            } catch {
                return "";
            }
        }
    }

    // Registro de la extensión en Scratch (o Penguinmod)
    Scratch.extensions.register(new FirebaseDB());
})(Scratch);
