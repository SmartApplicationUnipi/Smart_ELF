import * as EventReader from '../reader/EventReader';
import * as ElfUIEvent from '../ui/event/ElfUIEvent';

const TTS_URL: string = "ws://10.101.21.184:65432" // Remote TTS Service
// const TTS_URL: string = "ws://localhost:65432" // Local TTS Service

/**
 * UI event reader for interacting with TTS module
 */
export class TTSEventReader extends EventReader.BaseEventReader {
	private socket: WebSocket;

	/**
	 * Starts the reader
	 */
	public start(): void {
		try {
			this.socket = new WebSocket(TTS_URL);

			this.socket.onclose = () => {
				console.log("TTSEventReader: Socket closed...");
				this.socket = null;
			}

			this.socket.onmessage = message => {
				console.log(message);

				try {
					let data = JSON.parse(message.data);

					let event = new ElfUIEvent.ElfUIEvent()
						.putAny(ElfUIEvent.KEY_CONTENT, { "audio": data });

					setTimeout(_ => {
						this.listener.onEvent(event);
					}, 0);
				} catch (ex) {
					console.error(ex);
				}
			}

			this.socket.onopen = () => {
				console.log("TTSEventReader: Socket opened...");
			}
		} catch (ex) {
			console.error(ex);
			if (this.socket) this.socket.close();
			this.socket = null;
		}
	}
}