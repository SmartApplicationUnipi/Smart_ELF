import * as EventReader from '../reader/EventReader';

const TTS_URL: string = "ws://localhost:5888" // Remote
const PROTOCOL_WS: string = 'ws';

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

				// TODO: implement it
			}

			this.socket.onopen = () => {
				console.log("TTSEventReader: Socket opened...");
			}
		} catch (ex) {
			console.error(ex);
			if(this.socket) this.socket.close();
			this.socket = null;
		}
	}
}