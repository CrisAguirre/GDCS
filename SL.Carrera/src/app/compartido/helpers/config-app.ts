export class ConfigApp {
    private static instance: ConfigApp;

    private _api: string;

    private constructor() {

    }

    public static getInstance(): ConfigApp {
        if (!ConfigApp.instance) {
            ConfigApp.instance = new ConfigApp();
        }
        return ConfigApp.instance;
    }

    get api(): string {
        return this._api;
    }
    set api(value: string) {
        this._api = value;
    }
}