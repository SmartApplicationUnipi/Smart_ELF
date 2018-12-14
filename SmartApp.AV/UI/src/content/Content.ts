import { ElfUIEvent, KEY_CONTENT } from '../ui/event/ElfUIEvent';
import { ISBEEmotion } from '../emotion/Emotion';

let base64js = require('base64-js');

/**
 * This interface represent actions that the UI should handle.
 */
export interface IContent { }

export class GenericContent implements IContent {
    constructor(private data: any) { }

    /**
     * Get the data of this content.
     */
    public getData(): any {
        return this.data;
    }
}

/**
 * Represent an content that should be displayed by the UI.
 */
export class TextContent implements IContent {
    constructor(private text: string) { }

    /**
     * Returns the text.
     */
    public getText(): string {
        return this.text;
    }
}

/**
 * Represent a content that should be spoken by the UI.
 */
export class SpeechContent implements IContent {
    constructor(private text: string, private emotion: ISBEEmotion) { }

    /**
     * Returns the text to be spoken.
     */
    public getText(): string {
        return this.text;
    }

    /**
     * Returns the emotion with wich reproduce the text.
     */
    public getEmotion(): ISBEEmotion {
        return this.emotion;
    }
}

/**
 * Represents an audio that should be played by the UI.
 */
export class AudioContent implements IContent {
    private buffer: ArrayBuffer = null;

    constructor(private emotion: ISBEEmotion, private data: string|ArrayBuffer) {
        if(data instanceof ArrayBuffer) {
            this.buffer = data;
        }
    }

    /**
     * Returns the emotion of the audio
     */
    public getEmotion(): ISBEEmotion {
        return this.emotion;
    }

    /**
     * Get the audio file data.
     */
    public getAudioBytes(): ArrayBuffer {
        if (!this.buffer) {
            this.buffer = this.decodeBuffer(this.data as string);
        }
        return this.buffer;
    }

    /**
     * Decode the base64 encoding to an array of bytes.
     * @param data The base64 string
     */
    private decodeBuffer(data: string): ArrayBuffer {
        return base64js.toByteArray(data).buffer;
    }
}

/**
 * Factory class to build IContent objects
 */
export interface ContentFactory {
    /**
     * Create content objects out of an event
     * @param event The event to be processed
     */
    create(event: ElfUIEvent): Array<IContent>;
}
