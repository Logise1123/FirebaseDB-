(function(Scratch) { 
    'use strict';
    if (!Scratch.extensions.unsandboxed) throw new Error("FirebaseAuth must run unsandboxed");

    const icon = "data:image/png;base64,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";

    const AUTH_ENDPOINT = "https://identitytoolkit.googleapis.com/v1/accounts";
    const DOCS_URL = "https://logise1.neocities.org/firebaseauth";

    class FirebaseAuth {
        constructor() {
            this.apiKey = "";
            this.user = null; // Stores current user object
            this.token = "";  // Stores ID Token
            this.lastError = "";
        }

        getInfo() {
            return {
                id: "FirebaseAuth",
                name: "Firebase Auth",
                color1: "#FFC107", // Amber for Auth
                color2: "#FFA000",
                menuIconURI: icon,
                blocks: [
                    {
                        func: "openDocs",
                        blockType: Scratch.BlockType.BUTTON,
                        text: "Open Documentation"
                    },
                    {blockType: Scratch.BlockType.LABEL, text: "Configuration"},
                    {
                        opcode: "setAPIKey",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "set API Key to [KEY]",
                        arguments: {
                            KEY: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "AIzaSy..."
                            }
                        }
                    },
                    {blockType: Scratch.BlockType.LABEL, text: "Authentication"},
                    {
                        opcode: "signInAnonymously",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "sign in anonymously",
                    },
                    {
                        opcode: "signUpEmail",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "register with email [EMAIL] password [PASS]",
                        arguments: {
                            EMAIL: { type: Scratch.ArgumentType.STRING, defaultValue: "test@example.com" },
                            PASS: { type: Scratch.ArgumentType.STRING, defaultValue: "password123" }
                        }
                    },
                    {
                        opcode: "signInEmail",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "sign in with email [EMAIL] password [PASS]",
                        arguments: {
                            EMAIL: { type: Scratch.ArgumentType.STRING, defaultValue: "test@example.com" },
                            PASS: { type: Scratch.ArgumentType.STRING, defaultValue: "password123" }
                        }
                    },
                    {
                        opcode: "signOut",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "sign out",
                    },
                    {blockType: Scratch.BlockType.LABEL, text: "User Data"},
                    {
                        opcode: "isLoggedIn",
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: "is logged in?",
                    },
                    {
                        opcode: "getUserId",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "current user ID (UID)",
                    },
                    {
                        opcode: "getEmail",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "current email",
                    },
                    {
                        opcode: "getIdToken",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "current auth token",
                    },
                    {
                        opcode: "getLastError",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "last auth error",
                    }
                ]
            };
        }

        // --- Utilities ---
        async delay() {
            return new Promise(r => setTimeout(r, 1));
        }

        handleError(errorData) {
            console.error("Auth Error:", errorData);
            this.lastError = errorData.error ? errorData.error.message : "Unknown Error";
            return null;
        }

        openDocs() {
            window.open(DOCS_URL, "_blank");
        }

        // --- Blocks ---

        setAPIKey(args) {
            this.apiKey = args.KEY;
            this.lastError = "";
        }

        async signInAnonymously() {
            if (!this.apiKey) {
                this.lastError = "API Key not set";
                return;
            }
            await this.delay();
            try {
                // SignUp without data creates an anonymous user in the Firebase REST API
                const res = await fetch(`${AUTH_ENDPOINT}:signUp?key=${this.apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ returnSecureToken: true })
                });
                const data = await res.json();
                
                if (data.error) {
                    this.handleError(data);
                    this.user = null;
                    this.token = "";
                } else {
                    this.user = data;
                    this.token = data.idToken;
                    this.lastError = "";
                }
            } catch (e) {
                this.lastError = e.toString();
            }
        }

        async signUpEmail(args) {
            if (!this.apiKey) return;
            await this.delay();
            const { EMAIL, PASS } = args;
            try {
                const res = await fetch(`${AUTH_ENDPOINT}:signUp?key=${this.apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: EMAIL,
                        password: PASS,
                        returnSecureToken: true
                    })
                });
                const data = await res.json();

                if (data.error) {
                    this.handleError(data);
                } else {
                    this.user = data;
                    this.token = data.idToken;
                    this.lastError = "";
                }
            } catch (e) {
                this.lastError = e.toString();
            }
        }

        async signInEmail(args) {
            if (!this.apiKey) return;
            await this.delay();
            const { EMAIL, PASS } = args;
            try {
                const res = await fetch(`${AUTH_ENDPOINT}:signInWithPassword?key=${this.apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: EMAIL,
                        password: PASS,
                        returnSecureToken: true
                    })
                });
                const data = await res.json();

                if (data.error) {
                    this.handleError(data);
                    this.user = null;
                    this.token = "";
                } else {
                    this.user = data;
                    this.token = data.idToken;
                    this.lastError = "";
                }
            } catch (e) {
                this.lastError = e.toString();
            }
        }

        signOut() {
            this.user = null;
            this.token = "";
            this.lastError = "";
        }

        isLoggedIn() {
            return !!this.user && !!this.token;
        }

        getUserId() {
            return (this.user && this.user.localId) ? this.user.localId : "";
        }

        getEmail() {
            return (this.user && this.user.email) ? this.user.email : "";
        }

        getIdToken() {
            return this.token || "";
        }

        getLastError() {
            return this.lastError || "";
        }
    }

    Scratch.extensions.register(new FirebaseAuth());
})(Scratch);
