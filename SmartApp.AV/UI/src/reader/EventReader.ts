import { ElfUIEvent } from '../ui/event/ElfUIEvent';

/**
 * Interface for ElfUIEvent listeners.
 */
export interface IElfUIEventListener {
	/**
	 * Called when a new ElfUIEvent is received
	 * @param event 
	 */
	onEvent(event: ElfUIEvent): void;
}

/**
 * Base class for event readers for ElfUI
 */
export abstract class BaseEventReader {
	protected listener: IElfUIEventListener;

	/**
	 * Register a new IElfUIEventListener
	 * @param listener The listener to add
	 */
	public registerEventListener(listener: IElfUIEventListener): void {
		this.listener = listener;
	};

	/**
	 * Starts the reader.
	 */
	abstract start(): void;
}
