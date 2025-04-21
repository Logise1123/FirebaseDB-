// Name: FirebaseDB
// ID: firebasedb
// Description: Extension for online, password-protected Firebase database storage.
// By: Logise <https://scratch.mit.edu/users/Logise/>
// Original: FirebaseDB
// License: MPL-2.0

(function(Scratch) {
    'use strict';
    if (!Scratch.extensions.unsandboxed) throw new Error("FirebaseDB must run unsandboxed");
    const icon = "data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHdpZHRoPSIyMDguMDY5MzUiIGhlaWdodD0iMjA4LjA2OTM1IiB2aWV3Qm94PSIwLDAsMjA4LjA2OTM1LDIwOC4wNjkzNSI+PGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTIxNS45NjUzMiwtNzUuOTY1MzMpIj48ZyBzdHJva2U9Im5vbmUiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCI+PHBhdGggZD0iTTIxNS45NjUzMywxODBjMCwtNTcuNDU2NzYgNDYuNTc3OTEsLTEwNC4wMzQ2NyAxMDQuMDM0NjgsLTEwNC4wMzQ2N2M... (base64 continues)";

    class FirebaseDB {
        constructor() {
            this.api = "https://guessthepin-2fe64-default-rtdb.europe-west1.firebasedatabase.app";
        }

        getInfo() {
            return {
                id: "firebasedb",
                name: "Firebase DB",
                color1: "#fea631",
                menuIconURI: icon,
                blocks: [
                    { blockType: Scratch.BlockType.LABEL, text: "Made by @logise on Discord" },
                    {
                        opcode: "setKey",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "set key [KEY] to value [VALUE]",
                        arguments: {
                            KEY:   { type: Scratch.ArgumentType.STRING, defaultValue: "key"   },
                            VALUE: { type: Scratch.ArgumentType.STRING, defaultValue: "value" }
                        }
                    },
                    {
                        opcode: "getKey",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "get key [KEY]",
                        arguments: {
                            KEY: { type: Scratch.ArgumentType.STRING, defaultValue: "key" }
                        }
                    },
                    { blockType: Scratch.BlockType.LABEL, text: "Password Blocks:" },
                    {
                        opcode: "setKeyWithPassword",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "set key [KEY] to value [VALUE] with password [PASSWORD]",
                        arguments: {
                            KEY:      { type: Scratch.ArgumentType.STRING, defaultValue: "key"      },
                            VALUE:    { type: Scratch.ArgumentType.STRING, defaultValue: "value"    },
                            PASSWORD: { type: Scratch.ArgumentType.STRING, defaultValue: "password" }
                        }
                    },
                    {
                        opcode: "getKeyWithPassword",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "get key [KEY] with password [PASSWORD]",
                        arguments: {
                            KEY:      { type: Scratch.ArgumentType.STRING, defaultValue: "key"      },
                            PASSWORD: { type: Scratch.ArgumentType.STRING, defaultValue: "password" }
                        }
                    },
                    {
                        opcode: "checkPassword",
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: "check if password [PASSWORD] is valid for key [KEY]",
                        arguments: {
                            PASSWORD: { type: Scratch.ArgumentType.STRING, defaultValue: "password" },
                            KEY:      { type: Scratch.ArgumentType.STRING, defaultValue: "key"      }
                        }
                    },
                    { blockType: Scratch.BlockType.LABEL, text: "Semicip Blocks:" },
                    {
                        opcode: "setSemicipWithPassword",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "set key [KEY] to value [VALUE] with password [PASSWORD] in /semicip",
                        arguments: {
                            KEY:      { type: Scratch.ArgumentType.STRING, defaultValue: "key"      },
                            VALUE:    { type: Scratch.ArgumentType.STRING, defaultValue: "value"    },
                            PASSWORD: { type: Scratch.ArgumentType.STRING, defaultValue: "password" }
                        }
                    },
                    {
                        opcode: "getSemicip",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "get key [KEY] from /semicip",
                        arguments: {
                            KEY: { type: Scratch.ArgumentType.STRING, defaultValue: "key" }
                        }
                    }
                ]
            };
        }

        async delay() {
            const d = Math.random() * 500;
            return new Promise(r => setTimeout(r, d));
        }

        async setKey(args) {
            await this.delay();
            const { KEY, VALUE } = args;
            if (VALUE.length > 8000) return;
            await fetch(`${this.api}/pin/${encodeURIComponent(KEY)}.json`, {
                method: "PUT",
                body: JSON.stringify(VALUE)
            });
        }

        async getKey(args) {
            await this.delay();
            const { KEY } = args;
            const res = await fetch(`${this.api}/pin/${encodeURIComponent(KEY)}.json`);
            const data = await res.json();
            return data ?? "";
        }

        async deriveKey(password, salt) {
            const enc = new TextEncoder();
            const mat = await crypto.subtle.importKey(
                "raw", enc.encode(password), "PBKDF2", false, ["deriveKey"]
            );
            return crypto.subtle.deriveKey(
                { name:"PBKDF2", salt, iterations:100000, hash:"SHA-256" },
                mat,
                { name:"AES-GCM", length:256 },
                false,
                ["encrypt","decrypt"]
            );
        }

        async setKeyWithPassword(args) {
            await this.delay();
            const { KEY, VALUE, PASSWORD } = args;
            if (VALUE.length > 8000) return;
            const enc = new TextEncoder();
            const iv   = crypto.getRandomValues(new Uint8Array(12));
            const salt = crypto.getRandomValues(new Uint8Array(16));
            const key  = await this.deriveKey(PASSWORD, salt);
            const data = await crypto.subtle.encrypt({ name:"AES-GCM", iv }, key, enc.encode(VALUE));
            const pack = { iv:[...iv], salt:[...salt], data:[...new Uint8Array(data)] };
            await fetch(`${this.api}/cypher/${encodeURIComponent(KEY)}.json`, {
                method: "PUT",
                body: JSON.stringify(pack)
            });
        }

        async getKeyWithPassword(args) {
            await this.delay();
            const { KEY, PASSWORD } = args;
            const res = await fetch(`${this.api}/cypher/${encodeURIComponent(KEY)}.json`);
            const pack = await res.json();
            if (!pack?.data) return "";
            try {
                const iv   = new Uint8Array(pack.iv);
                const salt = new Uint8Array(pack.salt);
                const key  = await this.deriveKey(PASSWORD, salt);
                const dec  = await crypto.subtle.decrypt({ name:"AES-GCM", iv }, key, new Uint8Array(pack.data));
                return new TextDecoder().decode(dec);
            } catch {
                return "";
            }
        }

        async checkPassword(args) {
            await this.delay();
            const { KEY, PASSWORD } = args;
            const res = await fetch(`${this.api}/cypher/${encodeURIComponent(KEY)}.json`);
            const pack = await res.json();
            if (!pack?.data) return false;
            try {
                const iv   = new Uint8Array(pack.iv);
                const salt = new Uint8Array(pack.salt);
                const key  = await this.deriveKey(PASSWORD, salt);
                await crypto.subtle.decrypt({ name:"AES-GCM", iv }, key, new Uint8Array(pack.data));
                return true;
            } catch {
                return false;
            }
        }

        async setSemicipWithPassword(args) {
                await this.delay();
                const { KEY, VALUE, PASSWORD } = args;
                if (VALUE.length > 8000) return;

                const url = `${this.api}/semicip/${encodeURIComponent(KEY)}.json`;

                // 1. Comprobar existencia
                const getRes = await fetch(url);
                if (!getRes.ok) {
                        // Error en el GET: podrías lanzar un error o retornar
                        console.error(`Error al comprobar la clave: ${getRes.status}`);
                        return;
                }

                const existing = await getRes.json();

                // 2. Si no existe, creamos
                if (existing === null) {
                        await fetch(url, {
                                method: "PUT",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                        value: VALUE,
                                        password: PASSWORD
                                })
                        });
                        return;
                }

                // 3. Si existe, comprobamos contraseña
                if (existing.password !== PASSWORD) {
                        // Contraseña incorrecta: no hacemos PUT
                        console.warn("Contraseña incorrecta para la clave existente.");
                        return;
                }

                // 4. Contraseña correcta: actualizamos
                await fetch(url, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                                value: VALUE,
                                password: PASSWORD
                        })
                });
        }

        async getSemicip(args) {
            await this.delay();
            const { KEY } = args;
            // TODO: insert your own logic here (decryption, validation)
            const res = await fetch(
                `${this.api}/semicip/${encodeURIComponent(KEY)}.json`
            );
            const data = await res.json();
            return data.value ?? "";
        }
    }

    Scratch.extensions.register(new FirebaseDB());
})(Scratch);
