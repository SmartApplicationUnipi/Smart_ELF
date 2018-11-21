import * as EventReader from './EventReader'

/**
 * Event reader that does nothing.
 */
export class VoidEventReader extends EventReader.BaseEventReader {
	public start(): void {}
}