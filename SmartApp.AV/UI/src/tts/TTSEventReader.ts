import * as Logger from '../log/Logger';

import { BaseEventReader } from '../reader/EventReader';
import { ElfUIEvent, KEY_CONTENT } from '../ui/event/ElfUIEvent';

const TTS_URL: string = "ws://10.101.21.194:65432" // Remote TTS Service
// const TTS_URL: string = "ws://localhost:65432" // Local TTS Service

/**
 * UI event reader for interacting with TTS module
 */
export class TTSEventReader extends BaseEventReader {
	

	private socket: WebSocket;

	/**
	 * Starts the reader
	 */
	public start(): void {
		try {
			this.socket = new WebSocket(TTS_URL);

			this.socket.onclose = () => {
				Logger.getInstance().log(Logger.LEVEL.INFO, "TTSEventReader: Socket closed...");
				this.socket = null;
			}

			this.socket.onmessage = message => {
				Logger.getInstance().log(Logger.LEVEL.INFO, message);

				try {
					let data = JSON.parse(message.data);

					let event = new ElfUIEvent()
						.putAny(KEY_CONTENT, { "audio": data });

					setTimeout(_ => {
						this.listener.onEvent(event);
					}, 0);
				} catch (ex) {
					Logger.getInstance().log(Logger.LEVEL.ERROR, ex);
				}
			}

			this.socket.onopen = () => {
				Logger.getInstance().log(Logger.LEVEL.INFO, "TTSEventReader: Socket opened...");
			}
		} catch (ex) {
			Logger.getInstance().log(Logger.LEVEL.ERROR, ex);
			if (this.socket) this.socket.close();
			this.socket = null;
		}
	}
}