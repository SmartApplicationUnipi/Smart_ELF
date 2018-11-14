import * as ElfUIEvent from '../ui/event/ElfUIEvent';
import * as Emotion from '../emotion/Emotion';

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
    constructor(private text: string, private emotion: Emotion.IEmotion) { }

    /**
     * Returns the text to be spoken.
     */
    public getText(): string {
        return this.text;
    }

    /**
     * Returns the emotion with wich reproduce the text.
     */
    public getEmotion(): Emotion.IEmotion {
        return this.emotion;
    }
}

/**
 * Represents an audio that should be played by the UI.
 */
export class AudioContent implements IContent {
    private buffer: ArrayBuffer = null;

    constructor(private emotion: string, private data: string|ArrayBuffer) {
        if(data instanceof ArrayBuffer) {
            this.buffer = data;
        }
    }

    /**
     * Returns the emotion of the audio
     */
    public getEmotion(): string {
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
    create(event: ElfUIEvent.ElfUIEvent): Array<IContent>;
}

/**
 * Default implementation of ContentFactory
 */
export class DefaultContentFactory implements ContentFactory {

    create(event: ElfUIEvent.ElfUIEvent): Array<IContent> {
        let data = event.getAny(ElfUIEvent.KEY_CONTENT);

        let contents = [];
        for (var key in data) {
            switch (key) {
                case "audio":
                    try {
                        let emotion = data[key]['emotion'],
                            audioB64 = data[key]['audio'],
                            id = data[key]['id'];

                        contents.push(new AudioContent(emotion, audioB64));
                    } catch (ex) {
                        console.error("Cannot elaborate audio file", data, ex);
                    }
                    break;
                case "speech":
                    try {
                        let text = data[key]['text'], emotion = data[key]['emotion'];
                        if (text && emotion) {
                            contents.push(new SpeechContent(text, emotion));
                        } else {
                            console.error("Cannot get all data from speech content", data[key]);
                        }
                    } catch (ex) {
                        console.error("Cannot get data from speech content", data[key], ex);
                    }
                    break;
                case "text":
                    let text = data[key];
                    if (text) {
                        contents.push(new TextContent(text));
                    }
                    break;
                default:
                    let d = {};
                    d[key] = data[key];
                    contents.push(new GenericContent(d));
                    break;
            }
        }

        return contents;
    }

}