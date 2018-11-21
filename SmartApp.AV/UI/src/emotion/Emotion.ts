/**
 * This interface represent the concept of emotional state of ELF.
 * It is based on the Circumplex Model of Affect, providing Arousal and Valence values.
 */
export interface IEmotion {
	/**
	 * Returns the emotion color code
	 */
	getColor(): string

	/**
	 * Returns Arousal value
	 */
	getArousal(): number;

	/**
	 * Returns Valence value
	 */
	getValence(): number;
}

/**
 * This is an implementation of IEmotion based on trigonometry.
 */
export class Emotion implements IEmotion {
	private color: string;

	private third: number = 180.0 / 3;

	constructor(private valence: number, private arousal: number) {
		this.color = this.getColorFromCoord(valence, arousal);
	}

	private getColorFromCoord(valence: number, arousal: number): string {
		let angle = Math.atan2(valence, arousal) * 180.0 / Math.PI;

		if (angle < 0) {
			angle = 360 + angle;
		}

		if (angle < this.third)
			return '#FFFF66' //yellow suprised
		else if (angle < 180.0 - this.third)
			return '#00FF00' //green happy
		else if (angle < 180.0)
			return '#66CCFF' //light_blue sad
		else if (angle < 180.0 + this.third)
			return '#CC33FF' //jasmin disgust
		else if (angle < 360 - this.third)
			return '#FF0000' //red anger
		else
			return '#f48c42' //orange afraid
	}

	public getArousal(): number {
		return this.arousal;
	}

	public getValence(): number {
		return this.valence;
	}

	public getColor(): string {
		return this.color;
	}
}

/**
 * Returns a neutral emotion.
 */
export function getNeutral(): IEmotion {
	return new Emotion(0, 0);
}