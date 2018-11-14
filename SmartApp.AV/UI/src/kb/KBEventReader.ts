import * as EventReader from '../reader/EventReader';
import * as Message from './Message';
import * as ElfUIEvent from '../ui/event/ElfUIEvent';
import * as Logger from '../log/Logger';

// const KB_URL: string = "ws://localhost:5666" // Local KB
const KB_URL: string = "ws://10.101.58.58:5666" // Remote KB

/**
 * This class implements an BaseEventReader that receives messages from the KB.
 */
export class KBEventReader extends EventReader.BaseEventReader {

	private logger: Logger.ILogger = Logger.getInstance();

	/**
	 * Current session Id with the knowledge base.
	 */
	private sessionId: string = null;

	/**
	 * Socket for communicatin with the KB.
	 */
	private socket: WebSocket;

	/**
	 * Queue to store messages to be sent after registration to the KB.
	 */
	private queue: Array<Message.Message> = [];

	/**
	 * List of queries for the KB.
	 */
	private eventToSubscribe: Array<object> = [
		{
			relation: '$X', // TODO: only for test purposes
			subject: '$Y'
		}
	]

	public start(): void {
		try {
			this.socket = new WebSocket(KB_URL);

			this.socket.onclose = () => {
				this.logger.log(Logger.LEVEL.INFO, "KBEventReader: Socket closed...");
				this.socket = null;
			}

			var first = true;
			this.socket.onmessage = message => {
				this.logger.log(Logger.LEVEL.INFO, "KBEventReader:", message);

				if (first) {
					// First message is the response of registration.
					first = false;

					this.sessionId = message.data;

					this.logger.log(Logger.LEVEL.INFO, "SessionID set", this.sessionId);

					// Now subscribe to the events
					this.eventToSubscribe.forEach(obj => this.subscribeKB(obj));

					let sourcePatch = {};
					sourcePatch[PARAMS.ID_SOURCE] = this.sessionId;
					// Check the queue
					this.queue
					.map(message => message.copy(sourcePatch))
					.forEach(message => this.socket.send(JSON.stringify(message)));

					this.queue = [];
				} else {
					if (this.sessionId) {
						try {
							let data = JSON.parse(message.data);
							this.logger.log(Logger.LEVEL.INFO, data);

							let event = this.buildEvent(data);
							if (event) {
								this.listener.onEvent(event);
							}
						} catch (ex) {
							switch (message.data) {
								case "done":
								this.logger.log(Logger.LEVEL.INFO, "Last operation is successful.");
									break;
								case "fail":
								this.logger.log(Logger.LEVEL.INFO, "Last operation is successful.");
									break;
								default:
									this.logger.log(Logger.LEVEL.WARNING, "cannot parse JSON:", message.data);
									break;
							}
						}
					} else {
						this.logger.log(Logger.LEVEL.WARNING, "No SessionID set");
					}
				}
			}

			this.socket.onopen = () => {
				this.logger.log(Logger.LEVEL.INFO, "KBEventReader: Socket opened...");

				// Register the client to the KB first
				this.registerKB();
			}
		} catch (ex) {
			this.logger.log(Logger.LEVEL.ERROR, ex);
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
			if (this.isRegistered()) {
				this.subscribeKB(obj);
			}
		}
	}

	/**
	 * Build a new event out of an object with data.
	 * @param data An object containing event data
	 */
	private buildEvent(data: any): ElfUIEvent.ElfUIEvent {
		// TODO: This process should be based on registered queries and their responses from the KB
		return (new ElfUIEvent.ElfUIEvent()).putAny(ElfUIEvent.KEY_CONTENT, data);
	}

	/**
	 * Registers this reader to the KB.
	 */
	private registerKB(): void {
		let message = new Message.MessageBuilder()
			.setMethod(KB_OP.REGISTER)
			.build();
		this.socket.send(JSON.stringify(message));
	}

	/**
	 * Registers a new query to the KB.
	 * @param request The query to be sent
	 */
	private subscribeKB(request: object): void {
		let message = new Message.MessageBuilder()
			.setMethod(KB_OP.SUBSCRIBE)
			.addParam(PARAMS.ID_SOURCE, this.sessionId)
			.addParam(PARAMS.JSON_REQ, request)
			.build()
		this.socket.send(JSON.stringify(message));
	}

	/**
	 * Check whether the reader is registered or not to the KB.
	 */
	private isRegistered(): boolean {
		return !!this.sessionId;
	}

	/**
	 * Adds a new fact to the KB.
	 * @param message The message containing the new fact
	 */
	public addFactKB(message: Message.Message): void {
		if(this.isRegistered()) {
			this.socket.send(JSON.stringify(message));
		} else {
			this.queue.push(message);
		}
	}
}

/**
 * KB operations
 */
export enum KB_OP {
	REGISTER = "register",
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