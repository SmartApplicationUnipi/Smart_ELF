import * as Logger from '../../log/Logger';
import * as AudioPlayer from '../../audio/AudioPlayer';

import { ElfUI, ElfUIFactory } from '../../ui/ElfUI';
import { IEmotion } from '../../emotion/Emotion';
import { IContent, ContentFactory, AudioContent, TextContent, SpeechContent } from '../../content/Content';
import { DefaultContentFactory } from '../../content/DefaultContentFactory';
import { Snackbar } from '../../utils/Snackbar';
import { Point } from '../../utils/Point';
import { EmotionalUIWidget } from '../widget/UIWidget';
import { Smiley } from './widget/Smiley';

let _ = require('lodash');

/**
 * Colorful ElfUI.
 */
export class ElfColorfulUI extends ElfUI {

	private audioPlayer: AudioPlayer.AudioPlayer;
	private snackbar: Snackbar;

	private contentFactory: ContentFactory = new DefaultContentFactory();

	private content: HTMLElement;

	private smiley: Smiley;

	constructor(rootElement: HTMLElement, window: Window) {
		super(rootElement);

		this.snackbar = new Snackbar();
		this.audioPlayer = new AudioPlayer.AudioPlayer(AudioPlayer.getContext(window));
	}

	public onCreateView(root: HTMLElement): void {
		root.innerHTML = this.getTemplate();

		this.content = _.first(root.getElementsByClassName("ui-content"));
		
		this.smiley = new Smiley(root.ownerDocument);
		this.content.appendChild(this.smiley.getElement());
	}

	public onEmotionChanged(e: IEmotion): void {
		Logger.getInstance().log(Logger.LEVEL.INFO, "onEmotionChanged", e);

		// Change the background color. The CSS rules will handle the animation.
		this.content.style.backgroundColor = e.getColor();

		this.smiley.onEmotionChanged(e);
	}
	
	public onPositionChanged(p: Point): void {
		// Do nothing (by now)
		this.smiley.lookAt(p);
	}

	public onContentChanged(contents: Array<IContent>): void {
		Logger.getInstance().log(Logger.LEVEL.INFO, "onContentChanged", contents);

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
				Logger.getInstance().log(Logger.LEVEL.WARNING, "Cannot show this type of content", content);
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