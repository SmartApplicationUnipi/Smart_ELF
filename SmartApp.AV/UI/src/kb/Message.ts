import { KBEventReader, KB_OP, PARAMS } from './KBEventReader';

/**
 * Builder class for KBEventReader messages.
 */
export class MessageBuilder {
	private method: string;
	private params: object = {};

	constructor(private token: string) {}

	/**
	 * Set the current method
	 * @param op Operation to be performed
	 */
	public setMethod(op: KB_OP): MessageBuilder {
		this.method = op;
		return this;
	}

	/**
	 * Adds a new parameter
	 * @param key The parameter identified
	 * @param value The values associated with the parameter
	 */
	public addParam(key: PARAMS, value: any): MessageBuilder {
		this.params[key] = value;
		return this;
	}

	/**
	 * Build a new Message
	 */
	public build(): Message {
		return new Message(this.method, this.params, this.token);
	}
}

/**
 * This class represents a message that can be used to communicate with the KB.
 */
export class Message {
	constructor(private method: string, private params: object, private token: string) {}

	/**
	 * Clone the current message to a new one.
	 * @param params parameters to add to the new message.
	 */
	public copy(params: any): Message {
		let m = new Message(this.method, this.params, this.token);

		for(var key in params) {
			m.params[key] = params[key];
		}

		return m;
	}
}