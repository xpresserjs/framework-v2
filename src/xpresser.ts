import { Config } from "./types";
import ObjectCollection from "object-collection";

export class Xpresser {
    public config: ObjectCollection<Config>;

    /**
     * Initialize new xpresser instance
     * @param config
     */
    constructor(config: Config) {
        // Initialize Config as object-collection type.
        this.config = new ObjectCollection<Config>(config);
    }
}
