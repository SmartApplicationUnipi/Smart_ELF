import * as Emotion from '../../emotion/Emotion';

import { IContent } from '../../content/Content';

/**
 * Base interface for objects that can be displayed by the ElfUI.
 * Each UIWidget should implement the render() method in order to be displayed from the UI.
 */
export interface UIWidget {
	/**
	 * Returns the HTML code of this widget.
	 */
	render(): string;
}

/**
 * This class represent an item that have an emotion.
 */
export abstract class EmotionalUIWidget implements UIWidget {
	/**
	 * Construct the widget using a neutral emotion as default.
	 * @param emotion The current emotion. If nothing is passed, the neutral emotion is used.
	 */

	constructor(private emotion: Emotion.IEmotion = Emotion.getNeutral()) {}

	/**
	 * Set the new emotion to be displayed.
	 * @param emotion The new emotion
	 */
	public setEmotion(emotion: Emotion.IEmotion): void {
		this.emotion = emotion;
		this.onEmotionChanged(this.emotion);
	}

	/**
	 * Get the current emotion.
	 */
	public getEmotion(): Emotion.IEmotion {
		return this.emotion;
	}

	/**
	 * This method is called when the a new emotion is received from the ElfUI.
	 * @param emotion The new emotion received
	 */
	abstract onEmotionChanged(emotion: Emotion.IEmotion): void;

	/**
	 * Returns the HTML code of this widget.
	 */
	abstract render(): string;
};

/**
 * Interface that represent a factory for UIWidget starting from events.
 */
export interface UIWidgetFactory {
	create(event: IContent): Array<UIWidget>;
}