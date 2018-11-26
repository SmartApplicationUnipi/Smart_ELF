import { EmotionalUIWidget } from '../../../ui/widget/UIWidget';
import { IEmotion } from '../../../emotion/Emotion';
import * as Logger from '../../../log/Logger';
import { Point } from '../../../utils/Point';
import { CSSClassHelper } from '../../../utils/CSSClassHelper';

const MAJOR_EYE_X_MAX = 15;
const MINOR_EYE_X_MAX = 30;
const EYE_Y_MAX = 10;

export class Smiley extends EmotionalUIWidget {

    private element: HTMLElement;

    private leftEye: HTMLElement;
    private rightEye: HTMLElement;

    private eyeBlinker;
    private cssClassHelper: CSSClassHelper;

    private originalClassname: string;

    constructor(document: Document) {
        super();
        let e = document.createElement("div");
        e.innerHTML = this.render();

        this.element = e.firstElementChild.firstElementChild as HTMLElement;
        
        this.cssClassHelper = new CSSClassHelper(this.element);
        this.cssClassHelper.setBaseClass(this.element.className);

        this.leftEye = e.getElementsByClassName("left-eye")[0] as HTMLElement;
        this.rightEye = e.getElementsByClassName("right-eye")[0] as HTMLElement;

        this.element.addEventListener('animationend', () => {
            this.cssClassHelper.remove("blink");
        });

        // Start eye blinking
        this.eyeBlinker = setInterval(() => {
            this.cssClassHelper.add("blink");
        }, 2000);
    }

    /**
     * Return the HTMLElement where this smiley face is drawn
     */
    public getElement(): HTMLElement {
        return this.element;
    }

    public lookAt(p: Point): void {
        // Eye position
        let majorEye = this.rightEye, minorEye = this.leftEye;
        
        if(p.getX() < 0) {
            majorEye = this.leftEye;
            minorEye = this.rightEye;
        }

        minorEye.style.left = (p.getX() * MINOR_EYE_X_MAX) + "px";
        majorEye.style.left = (p.getX() * MAJOR_EYE_X_MAX) + "px";

        minorEye.style.top = (p.getY() * EYE_Y_MAX) + "px";
        majorEye.style.top = (p.getY() * EYE_Y_MAX) + "px";

        Logger.getInstance().log(Logger.LEVEL.INFO, "Eye position", p, minorEye.style.left, majorEye.style.right);
    }

    public onEmotionChanged(e: IEmotion): void {
        Logger.getInstance().log(Logger.LEVEL.INFO, "Smiley: onEmotionChanged", e);

        let third = 180.0 / 3;
        let angle = Math.atan2(e.getValence(), e.getArousal()) * 180.0 / Math.PI;

        if (angle < 0) {
            angle = 360 + angle;
        }

        console.log("ANGLE: ", angle)

        this.cssClassHelper.remove(["normal", "happy", "angry"]);
        if (angle < third) {
            // suprised
            this.cssClassHelper.add("normal")
        }
        else if (angle < 180.0 - third) {
            // happy
            this.cssClassHelper.add("happy")
        }
        else if (angle < 180.0) {
            // sad
            this.cssClassHelper.add("normal")
        }
        else if (angle < 180.0 + third) {
            // disgust
            this.cssClassHelper.add("normal")
        } else if (angle < 360 - third) {
            // anger
            this.cssClassHelper.add("angry")
        } else {
            // afraid
            this.cssClassHelper.add("normal")
        }
    }

    public render(): string {
        return '<div class="smiley-container">\
            <div class="smiley">\
                <div class="eyes">\
                    <div class="eye left-eye"></div>\
                    <div class="eye right-eye"></div>\
                </div>\
                <div class="mouth"></div>\
            </div>\
        </div>';
    }
}