import * as Logger from '../../log/Logger';
import * as AudioPlayer from '../../audio/AudioPlayer';

import { ElfUI, ElfUIFactory } from '../../ui/ElfUI';
import { IEmotion, Emotion } from '../../emotion/Emotion';
import { UIWidget, UIWidgetFactory, EmotionalWidget } from '../../ui/widget/UIWidget';
import { IContent, ContentFactory, DefaultContentFactory, AudioContent, TextContent, SpeechContent } from '../../content/Content';
import { DefaultUIWidget } from './widget/DefaultUIWidget';
import { TextUIWidget } from './widget/TextUIWidget';
import { ColorfulUIWidgetFactory } from './ColorfulUIWidgetFactory';
import { Snackbar } from '../../utils/Snackbar';

let _ = require('lodash');

/**
 * Colorful ElfUI.
 */
export class ElfColorfulUI extends ElfUI {
	private logger: Logger.ILogger = Logger.getInstance();

	private audioPlayer: AudioPlayer.AudioPlayer;
	private snackbar: Snackbar;

	private contentFactory: ContentFactory = new DefaultContentFactory();
	private widgetFactory: UIWidgetFactory = new ColorfulUIWidgetFactory();

	private content: HTMLElement;

	constructor(rootElement: HTMLElement, window: Window) {
		super(rootElement);

		this.snackbar = new Snackbar();
		this.audioPlayer = new AudioPlayer.AudioPlayer(AudioPlayer.getContext(window));
	}

	onCreateView(root: HTMLElement): void {
		root.innerHTML = this.getTemplate();

		this.content = _.first(root.getElementsByClassName("ui-content"));
	}

	public onEmotionChanged(e: IEmotion): void {
		this.logger.log(Logger.LEVEL.INFO, "onEmotionChanged", e);

		// Change the background color. The animation in CSS will handle the animation.
		this.content.style.backgroundColor = e.getColor();
	}
	public onContentChanged(contents: Array<IContent>): void {
		this.logger.log(Logger.LEVEL.INFO, "onContentChanged", contents);

		// TODO: We can do better than this
		let audioContents = contents.filter(content => content instanceof AudioContent);
		let otherContents = contents.filter(content => !(content instanceof AudioContent));

		// Display all the contents
		otherContents.forEach(content => {
			if (content instanceof TextContent) {
				this.snackbar.showText(content.getText());
			} if (content instanceof SpeechContent) {
				this.snackbar.showText(content.getText());
			} else {
				this.logger.log(Logger.LEVEL.WARNING, "TBI", content);
			}
		});

		// Play audio data
		audioContents.forEach(audioContent => {
			this.audioPlayer.play((audioContent as AudioContent).getAudioBytes());
		});
	}

	public getTemplate(): string {
		return '<div class="colorful-ui ui-content">\
		</div>';
	}

	public getContentFactory(): ContentFactory {
		return this.contentFactory;
	}
}

/**
 * Elf UI Factory for ElfColorfulUI.
 */
export class ElfColorfulUIFactory implements ElfUIFactory {
	constructor(private root: HTMLElement, private window: Window) { }

	create(): ElfUI {
		return new ElfColorfulUI(this.root, this.window);
	}
}