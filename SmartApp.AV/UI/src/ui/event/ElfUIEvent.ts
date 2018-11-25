/**
 * this class represents an event that something is happened.
 */
export class ElfUIEvent {
	/**
	 * Data contained.
	 */
	private data = {};

	/**
	 * 
	 * @param key The identifier of the event
	 * @param o The value of the event
	 */
	putAny(key: string, o: any): ElfUIEvent {
		this.data[key] = o;
		return this;
	}

	/**
	 * Returns the value assiciated with key
	 * @param key The event identifier
	 */
	getAny(key: string): any {
		return this.data[key];
	}

	public toString() {
        return 'ElfUIEvent (' +
        Object.keys(this.data)
        + ')';
    }
}

export const KEY_EMOTION: string = "key_emotion"
export const KEY_CONTENT: string = "key_event"
export const KEY_POSITION: string = "key_position"