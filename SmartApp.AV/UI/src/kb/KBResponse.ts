import * as Logger from "../log/Logger";

/**
 * This class represent a response received by the KB.
 */
export class KBResponse {

    private constructor(private success: boolean, private details: any) { }

    /**
     * Create a KBResponse from an object
     * @param obj object containing data
     */
    public static from(obj: string) {
        try {
            let data = JSON.parse(obj);
            return new KBResponse(data.success, data.details);
        } catch (ex) {
            Logger.getInstance().log(Logger.LEVEL.ERROR, "Cannot parse KBResponse", obj, ex);
        }
        return null;
    }

    /**
     * Returns true if this response is successfull
     */
    public isSuccessful(): boolean {
        return this.success;
    }

    /**
     * Returns the data contained into this response.
     */
    public getData(): any {
        return this.details;
    }
}