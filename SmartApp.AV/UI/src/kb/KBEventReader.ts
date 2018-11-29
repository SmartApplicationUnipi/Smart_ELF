import * as Logger from '../log/Logger';

import { BaseEventReader } from '../reader/EventReader';
import { Message, MessageBuilder } from './Message';
import { ElfUIEvent, KEY_CONTENT } from '../ui/event/ElfUIEvent';
import { KBResponse } from './KBResponse';
import { AutoSocket, AutoSocketListener } from '../utils/AutoSocket';

/**
 * This class implements an BaseEventReader that receives messages from the KB.
 */
export class KBEventReader extends BaseEventReader implements AutoSocketListener {

	/**
	 * Socket for communicatin with the KB.
	 */
	private socket: AutoSocket;

	constructor(private url: string) {
		super();
	}

	/**
	 * List of queries for the KB.
	 */
	private eventToSubscribe: Array<object> = [
		{ "TAG": "ENLP_EMOTIVE_ANSWER", "text": "$x", "valence": "$v", "arousal": "$a" },
		{ "TAG": "ENLP_ELF_EMOTION", "valence": "$v", "arousal": "$a" },
		{ "TAG": "VISION_FACE_ANALYSIS", "is_interlocutor": "True", "look_at": { "pinch": "$a", "yaw": "$b" } }
	];

	public start(): void {
		try {
			this.socket = new AutoSocket(this.url);
			this.socket.setListener(this);
			this.socket.start();
		} catch (ex) {
			Logger.getInstance().log(Logger.LEVEL.ERROR, ex);
			if (this.socket) this.socket.close();
			this.socket = null;
		}
	}

	/**
	 * Adds a new query for the KB.
	 * @param obj Query to add
	 */
	public addEventToSubscribe(obj: object) {
		if (obj) {
			this.eventToSubscribe.push(obj);

			// If the reader is already started, subscribe also for this event
			if (this.isConnectionOpen()) {
				this.subscribeKB(obj);
			}
		}
	}

	/**
	 * Build a new event out of a KBResponse with data.
	 * @param response A KBResponse containing event data
	 */
	private buildEvent(response: KBResponse): ElfUIEvent {
		// TODO: This process should be based on registered queries and their responses from the KB
		return (new ElfUIEvent()).putAny(KEY_CONTENT, response.getData());
	}

	/**
	 * Registers a new query to the KB.
	 * @param request The query to be sent
	 */
	private subscribeKB(request: object): void {
		let message = new MessageBuilder(KB_SECRET_TOKEN)
			.setMethod(KB_OP.SUBSCRIBE)
			.addParam(PARAMS.JSON_REQ, request)
			.build()
		this.send(message);
	}

	/**
	 * Adds a new fact to the KB.
	 * @param message The message containing the new fact
	 */
	public addFactKB(message: Message): void {
		if (this.isConnectionOpen()) {
			this.send(message);
		}
	}

	/**
	 * Check whether the reader is registered or not to the KB.
	 */
	public isConnectionOpen(): boolean {
		return !!this.socket;
	}

	/**
	 * Send a message to the KB
	 */
	private send(message: Message): void {
		Logger.getInstance().log(Logger.LEVEL.INFO, "KBEventReader: Sending ", message);
		return this.socket.send(JSON.stringify(message));
	}

	public onMessage(message: any): void {
		try {
			let response = KBResponse.from(message);
			Logger.getInstance().log(Logger.LEVEL.INFO, response);

			if (response.isSuccessful()) {
				Logger.getInstance().log(Logger.LEVEL.INFO, "Success!");

				// Check if is data or success response
				if (response.getData() instanceof Object) {
					// This is valid data to parse
					let event = this.buildEvent(response);
					if (event) {
						this.listener.onEvent(event);
					}
				}
			} else {
				Logger.getInstance().log(Logger.LEVEL.INFO, "FAIL!");
			}
		} catch (ex) {
			Logger.getInstance().log(Logger.LEVEL.ERROR, "KBEventReader: An error occurred while reading a new message", ex);
		}
	}

	public onError(error: any): void {
		Logger.getInstance().log(Logger.LEVEL.ERROR, "KBEventReader: Socket error.", error);
	}

	public onClose(): void {
		Logger.getInstance().log(Logger.LEVEL.INFO, "KBEventReader: Socket closed...");
		this.socket = null;
	}

	public onOpen(): void {
		Logger.getInstance().log(Logger.LEVEL.INFO, "KBEventReader: Socket opened...");

		// Now subscribe to the events
		this.eventToSubscribe.forEach(obj => this.subscribeKB(obj));
	}

}

/**
 * KB operations
 */
export enum KB_OP {
	REGISTER = "registerTags",
	ADD_FACT = "addFact",
	QUERY_BIND = "queryBind",
	SUBSCRIBE = "subscribe"
}

/**
 * KB message parameters
 */
export enum PARAMS {
	ID_SOURCE = "idSource",
	INFO_SUM = "infoSum",
	TTL = "ttl",
	RELIABILITY = "reliability",
	REVISIONING = "revisioning",
	JSON_FACT = "jsonFact",
	JSON_REQ = "jsonReq"
}

export const KB_SECRET_TOKEN: string = "smartapp1819"
export const KB_MY_ID: string = "my_kb_id"