import { Point } from "../../../../utils/Point";
import { EmotionalUIWidget } from "../../../widget/UIWidget";

export abstract class Face extends EmotionalUIWidget {

    constructor(private element: HTMLElement) {
        super();
    }

    abstract lookAt(p: Point): void;

    /**
     * Return the HTMLElement where this smiley face is drawn
     */
    public getElement(): HTMLElement {
        return this.element;
    }

    public setElement(element: HTMLElement): void {
        this.element = element;
    }
}