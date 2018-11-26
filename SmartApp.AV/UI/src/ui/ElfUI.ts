import { IEmotion } from '../emotion/Emotion';
import { ElfUIEvent, KEY_CONTENT, KEY_EMOTION, KEY_POSITION } from './event/ElfUIEvent';
import { BaseEventReader, IElfUIEventListener } from '../reader/EventReader';
import * as Content from '../content/Content';
import { Point } from '../utils/Point';

/**
 * Base class to implement a UI for ELf.
 * It handles events received from registered event readers and update all of its widgets.
 */
export abstract class ElfUI implements IElfUIEventListener {
	/**
	 * List of registered event readers.
	 */
	private eventReaders: Array<BaseEventReader> = new Array();

	constructor(private root: HTMLElement) {
		this.onCreateView(root);
	}

	/**
	 * Adds a new event reader.
	 * @param reader The reader to register
	 */
	public addEventReader(reader: BaseEventReader) {
		this.eventReaders.push(reader);
		reader.registerEventListener(this)
	}

	/**
	 * Method called when a new event is received from one of the registered event listeners.
	 * @param e 
	 */
	public onEvent(e: ElfUIEvent): void {
		let emotion = e.getAny(KEY_EMOTION) as IEmotion;
		if (emotion) {
			this.onEmotionChanged(e.getAny(KEY_EMOTION) as IEmotion);
		}
		
		let position = e.getAny(KEY_POSITION) as Point;
		if (position) {
			this.onPositionChanged(position);
		}

		let contents = this.getContentFactory().create(e);
		if (contents) {
			this.onContentChanged(contents);
		}
	}

	/**
	 * Returns the root HTMLElement used by the UI
	 */
	protected getRootElement(): HTMLElement {
		return this.root;
	}

	/**
	 * Display the UI. It should be confined as child of root.
	 * @param root The root HTMLElement where the UI should reside
	 */
	abstract onCreateView(root: HTMLElement): void;

	/**
	 * Method called when a new emotion is received
	 * @param e The emotion received
	 */
	abstract onEmotionChanged(e: IEmotion): void;

	/**
	 * Method called when there is a new position of the user
	 * @param p The point in the plane where the user is located w.r.t. ELF.
	 */
	abstract onPositionChanged(p: Point): void;

	/**
	 * Method called when new contents are received
	 * @param contents A list of contents to be dislayed
	 */
	abstract onContentChanged(contents: Array<Content.IContent>): void;
	/**
	 * Returns the HTML code to display the UI
	 */
	abstract getTemplate(): string;

	/**
	 * Returns a factory to build contents.
	 */
	abstract getContentFactory(): Content.ContentFactory;
}

/**
 * Builder class to construct ElfUI objects.
 */
export class Builder {
	/**
	 * Readers that will be added to the resulting UI.
	 */
	private readers: Array<BaseEventReader> = null;

	/**
	 * Construct a new Builder
	 * @param factory The factory used tobuid the UI
	 */
	constructor(private factory: ElfUIFactory) { }

	/**
	 * Adds a new event reader.
	 * @param readers The new event reader
	 */
	public setEventReaders(readers: Array<BaseEventReader>): Builder {
		this.readers = readers;
		return this;
	}

	/**
	 * Builds a new UI.
	 */
	public build() {
		let ui = this.factory.create();

		this.readers.forEach(reader => {
			ui.addEventReader(reader);
		});

		return ui;
	}
}

/**
 * Interface that represent a factory to build ElfUI objects.
 */
export interface ElfUIFactory {
	create(): ElfUI;
}