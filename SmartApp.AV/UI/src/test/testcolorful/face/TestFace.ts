import { IEmotion } from '../../../emotion/Emotion'
import { Point } from '../../../utils/Point'
import { EmotionalUIWidget } from '../../../ui/widget/UIWidget'

/**
 * Implementation of a widget displaying a face. For testing purposes only.
 */
export class TestFace extends EmotionalUIWidget {
	private imgElement: HTMLElement;

	constructor(rootElement: HTMLElement) {
		super();

		// Set up the drawing
		let doc = rootElement.ownerDocument;

		this.imgElement = doc.createElement('IMG');
		rootElement.appendChild(this.imgElement);

		this.imgElement.style.height = rootElement.style.height;
		this.imgElement.style.width = rootElement.style.width;

		this.update();
	}

	onEmotionChanged(emotion: IEmotion): void {
		this.update();
	}

	private update(): void {
		this.imgElement.setAttribute('src', this.getImagePathFromEmotion(this.getEmotion()));
	}

	private getImagePathFromEmotion(emotion: IEmotion): string {
		let point = new Point(emotion.getValence(), emotion.getArousal());

		// Compute the distance between the current emotion and the predefined one and get the nearest
		var best = null;
		var bestFace = null;
		for (var faceKey in FACES) {
			let face = FACES[faceKey];
			let distance = point.distanceTo(face.point);

			if (!best || best > distance) {
				best = distance;
				bestFace = face;
			}

			// Bottom element
			if (distance == 0) {
				return bestFace;
			}
		}

		return IMG_PATH + '/' + bestFace.name;
	}

	public render(): string { return "" }
}

const IMG_PATH = "res/img/faces";

/**
 * Availables pictures for emotions
 */
const FACES = {
	ANGER: {
		name: "anger.png",
		point: new Point(-0.8, 0.5)
	},
	DISGUST: {
		name: "disgust.png",
		point: new Point(-0.9, 0),
	},
	FEAR: {
		name: "fear.png",
		point: new Point(-0.6, 0.8),
	},
	JOY: {
		name: "joy.png",
		point: new Point(0.8, 0.5),
	},
	SADNESS: {
		name: "sadness.png",
		point: new Point(-0.9, -0.6),
	},
	SURPRISE: {
		name: "surprise.png",
		point: new Point(0.5, 0.8),
	}
	// NEUTRAL: {
	// 	name: "neutral.png",
	// 	point: new Point.Point(0, 0),
	// }
}