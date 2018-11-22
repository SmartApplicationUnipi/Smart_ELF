import { EmotionalUIWidget } from '../../../ui/widget/UIWidget';
import { IEmotion } from '../../../emotion/Emotion';
import * as Logger from '../../../log/Logger';

export class Smiley extends EmotionalUIWidget {

    private element: HTMLElement;

    private originalClassname: string;

    constructor(document: Document) {
        super();
        let e = document.createElement("div");
        e.innerHTML = this.render();

        this.element = e.firstChild as HTMLElement;
        this.originalClassname = this.element.className;
    }

    /**
     * Return the HTMLElement where this smiley face is drawn
     */
    public getElement(): HTMLElement {
        return this.element;
    }

    public onEmotionChanged(e: IEmotion): void {
        Logger.getInstance().log(Logger.LEVEL.INFO, "Smiley: onEmotionChanged", e);

        let third = 180.0 / 3;
        let angle = Math.atan2(e.getValence(), e.getArousal()) * 180.0 / Math.PI;

        if (angle < 0) {
            angle = 360 + angle;
        }

        console.log("ANGLE: ", angle)
        if (angle < third) {
            // suprised
            this.element.className = this.originalClassname + " normal"
        }
        else if (angle < 180.0 - third) {
            // happy
            this.element.className = this.originalClassname + " happy"
        }
        else if (angle < 180.0) {
            // sad
            this.element.className = this.originalClassname + " normal"
        }
        else if (angle < 180.0 + third) {
            // disgust
            this.element.className = this.originalClassname + " normal"
        } else if (angle < 360 - third) {
            // anger
            this.element.className = this.originalClassname + " angry"
        } else {
            // afraid
            this.element.className = this.originalClassname + " normal"
        }
    }

    public render(): string {
        return '<div class="smiley">\
            <div class="eyes">\
                <div class="eye"></div>\
                <div class="eye"></div>\
            </div>\
            <div class="mouth"></div>\
        </div>';
    }
}