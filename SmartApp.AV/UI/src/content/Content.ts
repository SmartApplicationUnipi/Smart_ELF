import * as ElfUIEvent from '../ui/event/ElfUIEvent';
import * as Emotion from '../emotion/Emotion';

/**
 * This interface represent actions that the UI should handle.
 */
export interface IContent { }

export class GenericContent implements IContent {
    constructor(private data: any) { }

    /**
     * Get the data of this content
     */
    public getData(): any {
        return this.data;
    }
}

/**
 * Represent an content that should be displayed by the UI
 */
export class TextContent implements IContent {
    constructor(private text: string) { }

    /**
     * Returns the text
     */
    public getText(): string {
        return this.text;
    }
}

/**
 * Represent an content that should be spoken by the UI
 */
export class SpeechContent implements IContent {
    constructor(private text: string, private emotion: Emotion.IEmotion) { }

    /**
     * Returns the text to be spoken
     */
    public getText(): string {
        return this.text;
    }

    /**
     * Returns the emotion with wich reproduce the text
     */
    public getEmotion(): Emotion.IEmotion {
        return this.emotion;
    }
}

/**
 * Factory class to build IContent objects
 */
export interface ContentFactory {
    create(event: ElfUIEvent.ElfUIEvent): Array<IContent>;
}