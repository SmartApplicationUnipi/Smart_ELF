import * as Logger from '../log/Logger';

/**
 * Interface that represent an audio player that can play and stop an audio
 */
export interface IAudioPlayer {
    play(arrayBuffer: ArrayBuffer): void;
    stop(): void;
}

/**
 * Default implementation of IAudioPlayer
 */
export class AudioPlayer {
    private logger: Logger.ILogger = Logger.getInstance();

    /**
     * True if the player is currently playing.
     */
    private isPlaying: boolean = false;

    /**
     * Audio source to use
     */
    private currentSource: AudioBufferSourceNode

    constructor(private context: AudioContext) {}

    /**
     * Play an audio represented by the array of bytes.
     * @param arrayBuffer The bytes array of audio to be played
     */
    public play(arrayBuffer: ArrayBuffer): void {
        try {
            this.currentSource = this.context.createBufferSource();

            this.currentSource.onended = () => {
                this.isPlaying = false;
            }

            this.context.decodeAudioData(arrayBuffer, buffer => {
                this.currentSource.buffer = buffer;
                this.currentSource.connect(this.context.destination);
    
                //now play the sound.
                this.currentSource.start(0);
            });

        } catch (ex) {
            this.logger.log(Logger.LEVEL.ERROR, ex);
        }
    }

    /**
     * Stop the player.
     */
    public stop(): void {
        if (this.isPlaying && this.currentSource) {
            this.currentSource.stop()
            this.currentSource = null;
        }
        this.isPlaying = false;
    }
}

/**
 * Singleton pattern
 */
var _instance = null;

export function getInstance(context) {
    if(!_instance) {
        _instance = new AudioPlayer(context);
    }
    return _instance;
}

/**
 * Get the available AudioContext
 * @param window Window object where to look for AudioContext
 */
export function getContext(window: Window): AudioContext {
    let w = window as any;
    let constr = w.AudioContext || w.webkitAudioContext || w.mozAudioContext
    return new constr();
}