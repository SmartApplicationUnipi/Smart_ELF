import * as Logger from '../log/Logger';

import { BaseEventReader } from '../reader/EventReader';
import { ElfUIEvent, KEY_CONTENT } from '../ui/event/ElfUIEvent';
import { AutoSocket, AutoSocketListener } from '../utils/AutoSocket';

/**
 * UI event reader for interacting with TTS module
 */
export class TTSEventReader extends BaseEventReader implements AutoSocketListener {

	/**
	 * Socket used for communicating with the TTS module.
	 */
	private socket: AutoSocket;

	constructor(private url: string) {
		super();
	}

	/**
	 * Starts the reader
	 */
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

	public onMessage(message: any): void {
		Logger.getInstance().log(Logger.LEVEL.INFO, message);

		try {
			let data = JSON.parse(message);

			let event = new ElfUIEvent()
				.putAny(KEY_CONTENT, { "audio": data });
				
			setTimeout(_ => {
				this.listener.onEvent(event);
			}, 0);
		} catch (ex) {
			Logger.getInstance().log(Logger.LEVEL.ERROR, ex);
		}
	}

	public onError(error: any): void {
		Logger.getInstance().log(Logger.LEVEL.ERROR, "TTSEventReader: an error occurred", error);
	}

	public onClose(): void {
		Logger.getInstance().log(Logger.LEVEL.INFO, "TTSEventReader: Socket closed...");
		this.socket = null;
	}

	public onOpen(): void {
		Logger.getInstance().log(Logger.LEVEL.INFO, "TTSEventReader: Socket opened...");
	}

}