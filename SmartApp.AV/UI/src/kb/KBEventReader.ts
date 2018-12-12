import * as Logger from '../log/Logger';

import { BaseEventReader } from '../reader/EventReader';
import { Message, MessageBuilder } from './Message';
import { ElfUIEvent, KEY_CONTENT, KEY_EMOTION, KEY_POSITION } from '../ui/event/ElfUIEvent';
import { KBResponse } from './KBResponse';
import { AutoSocket, AutoSocketListener } from '../utils/AutoSocket';
import { Point } from '../utils/Point';
import { ValenceArousalEmotion } from '../emotion/Emotion';
import { BehaviorRepository, IBehavior } from '../behavior/BehaviorRepository';

export class KBRule {
	constructor(private head: object, private body: Array<object>) { }

	public toString() {
		return JSON.stringify(this.head) + " <- " + this.body.map(val => JSON.stringify(val)).join(" ; ");
	}
}

/**
 * This class implements an BaseEventReader that receives messages from the KB.
 */
export class KBEventReader extends BaseEventReader implements AutoSocketListener {

	private behaviorRepo: BehaviorRepository = new BehaviorRepository();

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
	private eventToSubscribe: Array<{ _meta: object, _data: object }> = [
		// Other modules events
		{ _meta: { "tag": "ENLP_ELF_EMOTION" }, _data: { "valence": "$v", "arousal": "$a" } },
		{ _meta: { "tag": "VISION_FACE_ANALYSIS" }, _data: { "is_interlocutor": "True", "look_at": { "pinch": "$a", "yaw": "$b" } } },

		// UI Events
		{ _meta: { "tag": "UI_ELF_EMOTION" }, _data: { "valence": "$v", "arousal": "$a" } },
		{ _meta: { "tag": "UI_ELF_BEHAVIOR" }, _data: { 'defensive': '$x' } },
		{ _meta: { "tag": "UI_ELF_BEHAVIOR" }, _data: { 'thinking': '$x' } }
	];

	private rulesToAdd = [
		new KBRule({ "tag": "UI_ELF_BEHAVIOR", 'defensive': '$x' }, [{ 'z_index': '$x' }])
	]

	public start(): void {
		try {
			console.log("connecting KB at ", this.url);
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
	public addEventToSubscribe(obj: { _data: object, _meta: object }) {
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
	private buildEvent(d): ElfUIEvent {
		// TODO: This process should be based on registered queries and their responses from the KB

		let tag = d['object']['_meta']['tag'];
		let data = d['object']['_data'];
		switch (tag) {
			// TODO: those code should be with the definition of the query
			case 'ENLP_EMOTIVE_ANSWER':
				let emotion1 = {
					valence: data['valence'],
					arousal: data['arousal']
				}
				let ev1 = (new ElfUIEvent())
					.putAny(KEY_CONTENT, data);

				if (emotion1.valence != void 0 && emotion1.arousal != void 0) {
					ev1.putAny(KEY_EMOTION, new ValenceArousalEmotion(emotion1.valence, emotion1.arousal));
				}
				return ev1;
			case 'ENLP_ELF_EMOTION':
				let emotion2 = {
					valence: data['valence'],
					arousal: data['arousal']
				}
				let ev2 = (new ElfUIEvent())
					.putAny(KEY_CONTENT, data);

				if (emotion2.valence != void 0 && emotion2.arousal != void 0) {
					ev2.putAny(KEY_EMOTION, new ValenceArousalEmotion(emotion2.valence, emotion2.arousal));
				}
				return ev2;
			case 'VISION_FACE_ANALYSIS':
				let position = {
					x: data['look_at']['pinch'],
					y: data['look_at']['yaw']
				}
				let ev3 = new ElfUIEvent();
				if (position.x != void 0 && position.y != void 0) {
					ev3.putAny(KEY_POSITION, new Point(position.x, position.y));
				}
				return ev3;
			case 'UI_ELF_EMOTION':
				let emotion4 = {
					valence: data['valence'],
					arousal: data['arousal']
				}
				let ev4 = (new ElfUIEvent())
					.putAny(KEY_CONTENT, data);

				if (emotion4.valence != void 0 && emotion4.arousal != void 0) {
					ev4.putAny(KEY_EMOTION, new ValenceArousalEmotion(emotion4.valence, emotion4.arousal));
				}
				return ev4;
			case 'UI_ELF_BEHAVIOR':
				let behavior = this.behaviorRepo.getFromObject(data);

				if (behavior) {
					let emotion = behavior.getEmotion(data);
					if (emotion) {
						return new ElfUIEvent().putAny(KEY_EMOTION, emotion);
					}
				}
				break;
		}

		Logger.getInstance().log(Logger.LEVEL.ERROR, "Response not recognized.", data);
		return null;
	}

	/**
	 * Registers a new query to the KB.
	 * @param request The query to be sent
	 */
	private subscribeKB(request: { _data: object, _meta: object }): void {
		let message = new MessageBuilder(KB_SECRET_TOKEN)
			.setMethod(KB_OP.SUBSCRIBE)
			.addParam(PARAMS.JSON_REQ, request)
			.build();
		this.send(message);
	}

	/**
	 * Adds a new fact to the KB.
	 * @param message The message containing the new fact
	 */
	public addRule(rule: KBRule): void {
		if (this.isConnectionOpen()) {
			let message = new MessageBuilder(KB_SECRET_TOKEN)
				.setMethod(KB_OP.SUBSCRIBE)
				.addParam(PARAMS.JSON_REQ, rule.toString())
				.build();
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
					let d: Array<object> = response.getData();
					d.map((o) => {
						return this.buildEvent(o);
					}).forEach((e) => {
						if (e) {
							this.listener.onEvent(e);
						}
					});					
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

		// Add rules
		this.rulesToAdd.forEach(rule => this.addRule(rule))

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