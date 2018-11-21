import * as Emotion from '../emotion/Emotion';
import * as ElfUIEvent from './event/ElfUIEvent';
import * as EventReader from '../reader/EventReader';
import * as Content from '../content/Content';

/**
 * Base class to implement a UI for ELf.
 * It handles events received from registered event readers and update all of its widgets.
 */
export abstract class ElfUI implements EventReader.IElfUIEventListener {
	/**
	 * List of registered event readers.
	 */
	private eventReaders: Array<EventReader.BaseEventReader> = new Array();
	
	constructor(private root: HTMLElement) {
		this.onCreateView(root);
	}

	/**
	 * Adds a new event reader.
	 * @param reader The reader to register
	 */
	public addEventReader(reader: EventReader.BaseEventReader) {
		this.eventReaders.push(reader);
		reader.registerEventListener(this)
	}

	/**
	 * Method called when a new event is received from one of the registered event listeners.
	 * @param e 
	 */
	public onEvent(e: ElfUIEvent.ElfUIEvent) {
		let emotion = e.getAny(ElfUIEvent.KEY_EMOTION) as Emotion.IEmotion;
		if(emotion) {
			this.onEmotionChanged(e.getAny(ElfUIEvent.KEY_EMOTION) as Emotion.IEmotion);
		}
		let contents = this.getContentFactory().create(e);
		if(contents) {
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
	abstract onEmotionChanged(e: Emotion.IEmotion): void;

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
	 * Returns a factory to build widgets.
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
	private readers: Array<EventReader.BaseEventReader> = null;

	/**
	 * Construct a new Builder
	 * @param factory The factory used tobuid the UI
	 */
	constructor(private factory: ElfUIFactory) {}

	/**
	 * Adds a new event reader.
	 * @param readers The new event reader
	 */
	public setEventReaders(readers: Array<EventReader.BaseEventReader>): Builder {
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