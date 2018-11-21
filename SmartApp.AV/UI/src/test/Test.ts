import * as ElfUI from '../ui/ElfUI';
import * as EventReader from '../reader/EventReader'
import * as Emotion from '../emotion/Emotion';
import * as ElfUIEvent from '../ui/event/ElfUIEvent';
import * as UIWidget from '../ui/widget/UIWidget'

export class TestUI extends ElfUI.ElfUI {

	constructor(rootElement: HTMLElement) {
		super(rootElement);
	}

	public onCreateView(root: HTMLElement) {
		this.getRootElement().innerHTML = this.getTemplate();
	}

	public onEmotionChanged(e: Emotion.IEmotion): void {
		console.log("onEmotionChanged", e);

		this.getRootElement().style.backgroundColor = e.getColor();
	}

	public onContentChanged(e: Array<UIWidget.UIWidget>): void {
		console.log("onContentChanged", e);
	}

	public getTemplate(): string {
		return "<div>TEST</div>";
	}

	public getContentFactory(): UIWidget.UIWidgetFactory {
		return null;
	}
}

export class TestUIFactory implements ElfUI.ElfUIFactory {

	constructor(private root: HTMLElement) { }

	create(): ElfUI.ElfUI {
		return new TestUI(this.root);
	}
}

export class TestEventReader extends EventReader.BaseEventReader {
	count = 0;

	private events: Array<ElfUIEvent.ElfUIEvent> = []

	constructor(private delay: number = 0) {
		super();

		let e1 = new ElfUIEvent.ElfUIEvent()
			.putAny(ElfUIEvent.KEY_EMOTION, new Emotion.Emotion(-0.7, 0.4)) // Anger
			.putAny(ElfUIEvent.KEY_CONTENT, { "speech": { "text": "We should be Anger...", emotion: new Emotion.Emotion(0, 0) } })

		let e2 = new ElfUIEvent.ElfUIEvent()
			.putAny(ElfUIEvent.KEY_EMOTION, new Emotion.Emotion(-0.7, 0.1)) // Disgust
			.putAny(ElfUIEvent.KEY_CONTENT, { "speech": { "text": "We should be Disgust...", emotion: new Emotion.Emotion(0, 0) } })

		let e3 = new ElfUIEvent.ElfUIEvent()
			.putAny(ElfUIEvent.KEY_EMOTION, new Emotion.Emotion(-0.5, 0.7)) // Fear
			.putAny(ElfUIEvent.KEY_CONTENT, { "speech": { "text": "We should be Fear...", emotion: new Emotion.Emotion(0, 0) } })

		let e4 = new ElfUIEvent.ElfUIEvent()
			.putAny(ElfUIEvent.KEY_EMOTION, new Emotion.Emotion(0.7, 0.3)) // Joy
			.putAny(ElfUIEvent.KEY_CONTENT, { "speech": { "text": "We should be Joy...", emotion: new Emotion.Emotion(0, 0) } })

		let e5 = new ElfUIEvent.ElfUIEvent()
			.putAny(ElfUIEvent.KEY_EMOTION, new Emotion.Emotion(-0.7, -0.5)) // Sadness
			.putAny(ElfUIEvent.KEY_CONTENT, { "speech": { "text": "We should be Sadness...", emotion: new Emotion.Emotion(0, 0) } })

		let e6 = new ElfUIEvent.ElfUIEvent()
			.putAny(ElfUIEvent.KEY_EMOTION, new Emotion.Emotion(0.6, 0.9)) // Surprise
			.putAny(ElfUIEvent.KEY_CONTENT, { "speech": { "text": "We should be Surprise...", emotion: new Emotion.Emotion(0, 0) } })

		this.events.push(e1)
		this.events.push(e2)
		this.events.push(e3)
		this.events.push(e4)
		this.events.push(e5)
		this.events.push(e6)
	}

	private nextEvent(): ElfUIEvent.ElfUIEvent {
		let e = this.events[this.count];
		this.count = (this.count + 1) % this.events.length;
		return e;
	}

	public start() {
		let handler = () => {
			let e = this.nextEvent();

			this.listener.onEvent(e);

			setTimeout(handler, this.delay);
		};

		setTimeout(handler, this.delay);
	}
}
