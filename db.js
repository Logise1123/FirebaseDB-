(function(Scratch) {
    "use strict";
    if (!Scratch.extensions.unsandboxed) throw new Error("FirebaseDB must run unsandboxed");

    class FirebaseDB {
        constructor() {
            this.api = "https://guessthepin-2fe64-default-rtdb.europe-west1.firebasedatabase.app";
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
                        text: "set key [KEY] to value [VALUE]",
                        arguments: {
                            KEY: { type: Scratch.ArgumentType.STRING, defaultValue: "key" },
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
                    {
                        opcode: "setKeyWithPassword",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "set key [KEY] to value [VALUE] with password [PASSWORD]",
                        arguments: {
                            KEY: { type: Scratch.ArgumentType.STRING, defaultValue: "key" },
                            VALUE: { type: Scratch.ArgumentType.STRING, defaultValue: "value" },
                            PASSWORD: { type: Scratch.ArgumentType.STRING, defaultValue: "password" }
                        }
                    },
                    {
                        opcode: "getKeyWithPassword",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "get key [KEY] with password [PASSWORD]",
                        arguments: {
                            KEY: { type: Scratch.ArgumentType.STRING, defaultValue: "key" },
                            PASSWORD: { type: Scratch.ArgumentType.STRING, defaultValue: "password" }
                        }
                    },
                    {
                        opcode: "checkPassword",
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: "check if password [PASSWORD] is valid for key [KEY]",
                        arguments: {
                            PASSWORD: { type: Scratch.ArgumentType.STRING, defaultValue: "password" },
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
            const keyMaterial = await crypto.subtle.importKey(
                "raw", enc.encode(password), "PBKDF2", false, ["deriveKey"]
            );
            return await crypto.subtle.deriveKey(
                {
                    name: "PBKDF2",
                    salt,
                    iterations: 100000,
                    hash: "SHA-256"
                },
                keyMaterial,
                { name: "AES-GCM", length: 256 },
                false,
                ["encrypt", "decrypt"]
            );
        }

        async setKeyWithPassword(args) {
            await this.delay();
            const { KEY, VALUE, PASSWORD } = args;
            if (VALUE.length > 8000) return;

            const enc = new TextEncoder();
            const iv = crypto.getRandomValues(new Uint8Array(12));
            const salt = crypto.getRandomValues(new Uint8Array(16));
            const key = await this.deriveKey(PASSWORD, salt);
            const encrypted = await crypto.subtle.encrypt(
                { name: "AES-GCM", iv }, key, enc.encode(VALUE)
            );

            const fullPackage = {
                iv: Array.from(iv),
                salt: Array.from(salt),
                data: Array.from(new Uint8Array(encrypted))
            };

            await fetch(`${this.api}/cypher/${encodeURIComponent(KEY)}.json`, {
                method: "PUT",
                body: JSON.stringify(fullPackage)
            });
        }

        async getKeyWithPassword(args) {
            await this.delay();
            const { KEY, PASSWORD } = args;

            const res = await fetch(`${this.api}/cypher/${encodeURIComponent(KEY)}.json`);
            const encryptedPackage = await res.json();
            if (!encryptedPackage || !encryptedPackage.data || !encryptedPackage.iv || !encryptedPackage.salt) return "";

            try {
                const iv = new Uint8Array(encryptedPackage.iv);
                const salt = new Uint8Array(encryptedPackage.salt);
                const data = new Uint8Array(encryptedPackage.data);
                const key = await this.deriveKey(PASSWORD, salt);
                const decrypted = await crypto.subtle.decrypt(
                    { name: "AES-GCM", iv }, key, data
                );
                return new TextDecoder().decode(decrypted);
            } catch (e) {
                return "";
            }
        }

        async checkPassword(args) {
            await this.delay();
            const { KEY, PASSWORD } = args;

            const res = await fetch(`${this.api}/cypher/${encodeURIComponent(KEY)}.json`);
            const encryptedPackage = await res.json();
            if (!encryptedPackage || !encryptedPackage.data || !encryptedPackage.iv || !encryptedPackage.salt) return false;

            try {
                const iv = new Uint8Array(encryptedPackage.iv);
                const salt = new Uint8Array(encryptedPackage.salt);
                const data = new Uint8Array(encryptedPackage.data);
                const key = await this.deriveKey(PASSWORD, salt);
                await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data);
                return true;
            } catch (e) {
                return false;
            }
        }
    }

    Scratch.extensions.register(new FirebaseDB());
})(Scratch);
