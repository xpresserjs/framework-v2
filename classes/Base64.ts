/**
 * Xpresser base64 class
 * Provides base64 encoding and decoding functions.
 */
class Base64 {
    /**
     * Encode Str or Object
     * If Object, we will Json.stringify it
     * @param str
     */
    static encode(str: string | object): string {
        if (typeof str === "object") {
            str = JSON.stringify(str);
        }

        return Buffer.from(str).toString("base64");
    }

    /**
     * Decode encoded text.
     * @param str
     */
    static decode(str: string): string {
        return Buffer.from(str, "base64").toString("ascii");
    }

    /**
     * Decode To Json Object
     * @param str
     */
    static decodeToObject(str: string): object {
        str = this.decode(str);
        return JSON.parse(str);
    }
}

export default Base64;
