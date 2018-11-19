import * as Logger from '../../log/Logger';
import * as AudioPlayer from '../../audio/AudioPlayer';

import { ElfUI, ElfUIFactory } from '../../ui/ElfUI';
import { IEmotion, Emotion } from '../../emotion/Emotion';
import { UIWidget, UIWidgetFactory, EmotionalWidget } from '../../ui/widget/UIWidget';
import { TestFace } from './face/TestFace';
import { IContent, ContentFactory, DefaultContentFactory, AudioContent } from '../../content/Content';
import { DefaultUIWidget } from './widget/DefaultTestUIWidget';
import { TextTestUIWidget } from './widget/TextTestUIWidget';
import { TestColorfulUIWidgetFactory } from './TestColorfulUIWidgetFactory';

let _ = require('lodash');

/**
 * Colorful ElfUI.
 */
export class TestElfColorfulUI extends ElfUI {
	private logger: Logger.ILogger = Logger.getInstance();

	private upperPanel: Element;
	private lowerPanel: Element;
	private textPanel: Element;
	private resourcePanel: Element;
	private facePanel: Element;

	private face: EmotionalWidget;

	private audioPlayer: AudioPlayer.AudioPlayer;

	private contentFactory: ContentFactory = new DefaultContentFactory();
	private widgetFactory: UIWidgetFactory = new TestColorfulUIWidgetFactory();

	constructor(rootElement: HTMLElement, window: Window) {
		super(rootElement);

		this.audioPlayer = new AudioPlayer.AudioPlayer(AudioPlayer.getContext(window));
	}

	onCreateView(root: HTMLElement): void {
		root.innerHTML = this.getTemplate();

		this.upperPanel = root.getElementsByClassName("upper-panel")[0];
		this.lowerPanel = root.getElementsByClassName("lower-panel")[0];

		this.textPanel = root.getElementsByClassName("text-panel")[0];
		this.resourcePanel = root.getElementsByClassName("resource-panel")[0];
		this.facePanel = root.getElementsByClassName("face-panel")[0];

		this.face = new TestFace(this.facePanel as HTMLElement);
	}

	public onEmotionChanged(e: IEmotion): void {
		this.logger.log(Logger.LEVEL.INFO, "onEmotionChanged", e);

		this.getRootElement().style.backgroundColor = e.getColor();

		this.face.setEmotion(e);
	}
	public onContentChanged(contents: Array<IContent>): void {
		this.logger.log(Logger.LEVEL.INFO, "onContentChanged", contents);

		let audioContents = contents.filter(content => content instanceof AudioContent);

		this.resetView();

		// flatten the array
		(([] as Array<UIWidget>).concat(...contents.map(content => this.widgetFactory.create(content))))
			.filter(widget => {
				if (!widget) this.logger.log(Logger.LEVEL.WARNING, "Null widget found");
				return !!widget;
			})
			.map(widget => this.createElement(widget))
			.map(pair => {
				if (pair.content instanceof TextTestUIWidget) {
					this.textPanel.appendChild(pair.element);
				} else if (pair.content instanceof DefaultUIWidget) {
					this.resourcePanel.appendChild(pair.element);
				} else {
					this.logger.log(Logger.LEVEL.ERROR, "Pair discarded: no matching type.", pair);
				}
			});

		audioContents.forEach(audioContent => {
			this.audioPlayer.play((audioContent as AudioContent).getAudioBytes());
		})
	}

	public getTemplate(): string {
		return '<div class="test-ui ui-content">\
			<div class="upper-panel">\
				<div class="resource-panel"></div>\
				<div class="face-panel"></div>\
			</div>\
			<div class="lower-panel">\
				<div class="text-panel"></div>\
			</div>\
		</div>';
	}

	public getContentFactory(): ContentFactory {
		return this.contentFactory;
	}

	private createElement(widget: UIWidget): { content: UIWidget, element: ChildNode } {
		let elem = document.createElement('div');
		elem.innerHTML = widget.render();
		return { content: widget, element: elem.firstChild };
	}

	private resetView() {
		this.clearPanel(this.resourcePanel);
		this.clearPanel(this.textPanel);
	}

	private clearPanel(panel: Element) {
		while (panel.firstChild) {
			panel.removeChild(panel.firstChild);
		}
	}
}

export class TestElfColorfulUIFactory implements ElfUIFactory {

	constructor(private root: HTMLElement, private window: Window) { }

	create(): ElfUI {
		return new TestElfColorfulUI(this.root, this.window);
	}
}