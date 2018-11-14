import * as ElfUI from '../ElfUI';
import * as Emotion from '../../emotion/Emotion';
import * as UIWidget from '../widget/UIWidget';
import * as Face from './face/Face';
import * as Content from '../../content/Content';
import * as AudioPlayer from '../../audio/AudioPlayer';
import * as Logger from '../../log/Logger';

var _ = require('lodash');

/**
 * Default widget that displays raw data.
 */
class DefaultUIWidget implements UIWidget.UIWidget {
	constructor(private data: any) { }

	public getData() {
		return this.data;
	}

	render(): string {
		return JSON.stringify(this.data);
	}
}

/**
 * Widget that display text.
 */
class TextUIWidget implements UIWidget.UIWidget {
	constructor(private text: string) { }

	render(): string {
		return "<div>" + this.text + "</div>";
	}
}

/**
 * Widget factory that builds widget for ElfColorfulUI
 */
class ColorfulUIWidgetFactory implements UIWidget.UIWidgetFactory {
	private logger = Logger.getInstance();

	create(content: Content.IContent): Array<UIWidget.UIWidget> {
		if (content instanceof Content.SpeechContent) {
			return [new TextUIWidget(content.getText())];
		} else if (content instanceof Content.GenericContent) {
			return [new DefaultUIWidget(content.getData())];
		}

		this.logger.log(Logger.LEVEL.WARNING, "Content not recognized", content);
		return null;
	}
}

/**
 * Colorful ElfUI.
 */
export class ElfColorfulUI extends ElfUI.ElfUI {
	private logger: Logger.ILogger = Logger.getInstance();

	private upperPanel: Element;
	private lowerPanel: Element;
	private textPanel: Element;
	private resourcePanel: Element;
	private facePanel: Element;

	private face: UIWidget.EmotionalWidget;

	private audioPlayer: AudioPlayer.AudioPlayer;

	private contentFactory: Content.ContentFactory = new Content.DefaultContentFactory();
	private widgetFactory: UIWidget.UIWidgetFactory = new ColorfulUIWidgetFactory();

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

		this.face = new Face.TestFace(this.facePanel as HTMLElement);
	}

	public onEmotionChanged(e: Emotion.IEmotion): void {
		this.logger.log(Logger.LEVEL.INFO, "onEmotionChanged", e);

		this.getRootElement().style.backgroundColor = e.getColor();

		this.face.setEmotion(e);
	}
	public onContentChanged(contents: Array<Content.IContent>): void {
		this.logger.log(Logger.LEVEL.INFO, "onContentChanged", contents);

		let audioContents = contents.filter(content => content instanceof Content.AudioContent);

		this.resetView();

		// flatten the array
		(([] as Array<UIWidget.UIWidget>).concat(...contents.map(content => this.widgetFactory.create(content))))
			.filter(widget => {
				if (!widget) this.logger.log(Logger.LEVEL.WARNING, "Null widget found");
				return !!widget;
			})
			.map(widget => this.createElement(widget))
			.map(pair => {
				if (pair.content instanceof TextUIWidget) {
					this.textPanel.appendChild(pair.element);
				} else if (pair.content instanceof DefaultUIWidget) {
					this.resourcePanel.appendChild(pair.element);
				} else {
					this.logger.log(Logger.LEVEL.ERROR, "Pair discarded: no matching type.", pair);
				}
			});

		audioContents.forEach(audioContent => {
			this.audioPlayer.play((audioContent as Content.AudioContent).getAudioBytes());
		})
	}

	public getTemplate(): string {
		return '<div class="ui-content">\
			<div class="upper-panel">\
				<div class="resource-panel"></div>\
				<div class="face-panel"></div>\
			</div>\
			<div class="lower-panel">\
				<div class="text-panel"></div>\
			</div>\
		</div>';
	}

	public getContentFactory(): Content.ContentFactory {
		return this.contentFactory;
	}

	private createElement(widget: UIWidget.UIWidget): { content: UIWidget.UIWidget, element: ChildNode } {
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

export class ElfColorfulUIFactory implements ElfUI.ElfUIFactory {

	constructor(private root: HTMLElement, private window: Window) { }

	create(): ElfUI.ElfUI {
		return new ElfColorfulUI(this.root, this.window);
	}
}