import * as Logger from '../../log/Logger';
import * as AudioPlayer from '../../audio/AudioPlayer';

import { ElfUI, ElfUIFactory } from '../../ui/ElfUI';
import { ISBEEmotion, EmotionColorAdapter } from '../../emotion/Emotion';
import { IContent, ContentFactory, AudioContent, TextContent, SpeechContent } from '../../content/Content';
import { DefaultContentFactory } from '../../content/DefaultContentFactory';
import { Snackbar } from '../../utils/Snackbar';
import { Point } from '../../utils/Point';
import { EmotionalUIWidget } from '../widget/UIWidget';
import { Smiley } from './widget/Smiley';
import { Face } from './widget/face/Face';
import { SVGFace } from './widget/svgface/SVGFace';

let _ = require('lodash');
let anime = require("animejs");

/**
 * Colorful ElfUI.
 */
export class ElfColorfulUI extends ElfUI {

	private audioPlayer: AudioPlayer.AudioPlayer;
	private snackbar: Snackbar;

	private contentFactory: ContentFactory = new DefaultContentFactory();

	private content: HTMLElement;

	// private smiley: Smiley;
	private svgFace: Face;
	private thinkingEl: HTMLElement;

	constructor(rootElement: HTMLElement, window: Window) {
		super(rootElement);

		this.snackbar = new Snackbar();
		this.audioPlayer = new AudioPlayer.AudioPlayer(AudioPlayer.getContext(window));
	}

	public onCreateView(root: HTMLElement): void {
		root.innerHTML = this.getTemplate();

		this.content = _.first(root.getElementsByClassName("ui-content"));
		
		// this.smiley = new Smiley(root.ownerDocument);
		// this.content.appendChild(this.smiley.getElement());
		this.svgFace = new SVGFace(root.ownerDocument);
		this.content.appendChild(this.svgFace.getElement());

		// start thinking
		this.thinkingEl = _.first(root.getElementsByClassName("thinking-box"));
		this.thinkingEl.style.visibility = 'hidden';
		anime({
			targets: '#thinking-box',
			rotate: 360,
			loop: true
		})
	}

	public onEmotionChanged(e: ISBEEmotion): void {
		Logger.getInstance().log(Logger.LEVEL.INFO, "onEmotionChanged", e);

		// Change the background color. The CSS rules will handle the animation.
		this.content.style.backgroundColor = EmotionColorAdapter.getAdapter(e).getColor(e);

		if(!e.getThinking()) {
			// show thining
			this.thinkingEl.style.visibility = 'hidden';
		} else {
			// hide thinking
			this.thinkingEl.style.visibility = 'visible';
		}

		// this.smiley.onEmotionChanged(e);
		this.svgFace.onEmotionChanged(e);
	}
	
	public onPositionChanged(p: Point): void {
		this.svgFace.lookAt(p);
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
			<div id="thinking-box" class="thinking-box" style="position: relative">\
				<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Layer_1" x="15px" y="15px" viewBox="0 0 30 30" style="enable-background:new 0 0 30 30;" xml:space="preserve" width="100px" height="100px">\
					<path d="M27,14h-0.172c-0.478,0-0.904-0.337-0.98-0.809c-0.037-0.229-0.081-0.456-0.132-0.68c-0.106-0.464,0.158-0.933,0.597-1.115  l0.156-0.065c0.51-0.211,0.753-0.796,0.541-1.307v0c-0.211-0.51-0.796-0.753-1.307-0.541l-0.16,0.066  c-0.441,0.183-0.961,0.035-1.214-0.37c-0.122-0.196-0.25-0.388-0.384-0.576c-0.277-0.388-0.213-0.924,0.124-1.261l0.122-0.122  c0.391-0.391,0.391-1.024,0-1.414l0,0c-0.391-0.391-1.024-0.391-1.414,0L22.656,5.93c-0.337,0.337-0.873,0.401-1.261,0.124  c-0.188-0.134-0.38-0.262-0.576-0.384c-0.405-0.252-0.553-0.773-0.37-1.214l0.066-0.16c0.211-0.51-0.031-1.095-0.541-1.307  c-0.51-0.211-1.095,0.031-1.307,0.541l-0.065,0.156c-0.182,0.439-0.651,0.703-1.115,0.597c-0.224-0.051-0.451-0.095-0.68-0.132  C16.337,4.076,16,3.65,16,3.172V3c0-0.552-0.448-1-1-1s-1,0.448-1,1v0.172c0,0.478-0.337,0.904-0.809,0.98  c-0.229,0.037-0.456,0.081-0.68,0.132c-0.464,0.106-0.933-0.158-1.115-0.597l-0.065-0.156c-0.211-0.51-0.796-0.753-1.307-0.541  c-0.51,0.211-0.753,0.796-0.541,1.307l0.066,0.16C9.733,4.897,9.586,5.418,9.18,5.67C8.984,5.792,8.792,5.92,8.605,6.053  C8.217,6.33,7.681,6.267,7.344,5.93L7.222,5.808c-0.391-0.391-1.024-0.391-1.414,0l0,0c-0.39,0.391-0.39,1.024,0,1.414L5.93,7.344  C6.267,7.681,6.33,8.216,6.053,8.605C5.92,8.792,5.792,8.984,5.67,9.18C5.418,9.586,4.897,9.733,4.456,9.55l-0.16-0.066  c-0.51-0.211-1.095,0.031-1.307,0.541v0c-0.211,0.51,0.031,1.095,0.541,1.307l0.156,0.065c0.439,0.182,0.703,0.651,0.597,1.115  c-0.051,0.224-0.095,0.451-0.132,0.68C4.076,13.663,3.65,14,3.172,14H3c-0.552,0-1,0.448-1,1v0c0,0.552,0.448,1,1,1h0.172  c0.478,0,0.904,0.337,0.98,0.809c0.037,0.229,0.081,0.456,0.132,0.68c0.106,0.464-0.158,0.933-0.597,1.115l-0.156,0.065  c-0.51,0.211-0.753,0.796-0.541,1.307v0c0.211,0.51,0.796,0.753,1.307,0.541l0.16-0.066c0.441-0.183,0.961-0.035,1.214,0.37  c0.122,0.196,0.25,0.388,0.384,0.576c0.277,0.388,0.213,0.924-0.124,1.261l-0.122,0.122c-0.391,0.391-0.391,1.024,0,1.414  s1.024,0.391,1.414,0l0.122-0.122c0.337-0.337,0.873-0.401,1.261-0.124c0.188,0.134,0.38,0.262,0.576,0.384  c0.405,0.252,0.553,0.773,0.37,1.214l-0.066,0.16c-0.211,0.51,0.031,1.095,0.541,1.307c0.51,0.211,1.095-0.031,1.307-0.541  l0.065-0.156c0.182-0.439,0.651-0.703,1.115-0.597c0.224,0.051,0.451,0.095,0.68,0.132C13.663,25.924,14,26.35,14,26.828V27  c0,0.552,0.448,1,1,1s1-0.448,1-1v-0.172c0-0.478,0.337-0.904,0.809-0.98c0.229-0.037,0.456-0.081,0.68-0.132  c0.464-0.106,0.933,0.158,1.115,0.597l0.065,0.156c0.211,0.51,0.796,0.753,1.307,0.541c0.51-0.211,0.753-0.796,0.541-1.307  l-0.066-0.16c-0.183-0.441-0.035-0.961,0.37-1.214c0.196-0.122,0.388-0.25,0.576-0.384c0.388-0.277,0.924-0.213,1.261,0.124  l0.122,0.122c0.391,0.391,1.024,0.391,1.414,0s0.391-1.024,0-1.414l-0.122-0.122c-0.337-0.337-0.401-0.873-0.124-1.261  c0.134-0.188,0.262-0.38,0.384-0.576c0.252-0.405,0.773-0.553,1.214-0.37l0.16,0.066c0.51,0.211,1.095-0.031,1.307-0.541v0  c0.211-0.51-0.031-1.095-0.541-1.307l-0.156-0.065c-0.439-0.182-0.703-0.651-0.597-1.115c0.051-0.224,0.095-0.451,0.132-0.68  C25.924,16.337,26.35,16,26.828,16H27c0.552,0,1-0.448,1-1v0C28,14.448,27.552,14,27,14z M15,23c-4.418,0-8-3.582-8-8s3.582-8,8-8  s8,3.582,8,8S19.418,23,15,23z"/>\
					<rect x="15" y="14" width="9" height="2"/>\
					<rect x="8.25" y="10.103" transform="matrix(0.5 0.866 -0.866 0.5 15.9904 -5.4904)" width="9" height="2"/>\
					<rect x="8.125" y="17.681" transform="matrix(-0.5 0.866 -0.866 -0.5 35.4904 16.8708)" width="9.5" height="2"/>\
					<circle cx="15" cy="15" r="2"/>\
				</svg>\
			<\div>\
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