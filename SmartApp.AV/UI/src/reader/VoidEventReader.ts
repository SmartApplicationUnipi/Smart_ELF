import { BaseEventReader } from './EventReader'

/**
 * Event reader that does nothing.
 */
export class VoidEventReader extends BaseEventReader {
	public start(): void {}
}