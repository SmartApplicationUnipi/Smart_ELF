import { ISBEEmotion } from "../../../../../emotion/Emotion";
import { Point } from "../../../../../utils/Point";

export abstract class AbstractSVGFaceComponent {

    protected properties = [];

    constructor(private id: string) { }

    public getId(): string {
        return this.id;
    }

    protected computePropertiesUpdates(e: ISBEEmotion): object {
        return this.properties
            .map(f => f(e))
            .reduce((res, current) => {
                Object.keys(current).forEach(key => {
                    res[key] = current[key]; // TODO: This does not merge properties! It's ok?
                });
                return res;
            });
    }

    abstract setX(x: number): void;
    abstract setY(y: number): void;
    abstract render(): string;
    abstract lookAt(p: Point): void;
    abstract onEmotionChanged(e: ISBEEmotion): void;
}