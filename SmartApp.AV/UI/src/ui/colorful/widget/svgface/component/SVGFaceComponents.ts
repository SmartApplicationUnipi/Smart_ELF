import { AbstractSVGFaceComponent } from "./AbstractSVGFaceComponent";
import { IAnimated } from "../IAnimated";
import { ISBEEmotion } from "../../../../../emotion/Emotion";
import { EyeOpenessPropertyAdapter, EyebrowRotationPropertyAdapter, MouthRotationPropertyAdapter } from "../property/SVGFaceAdapters";
import { Point } from "../../../../../utils/Point";
import * as Logger from '../../../../../log/Logger';

let anime = require("animejs");

const DEFAULT_EYE_RADIUS = 42.64;

export class Eye extends AbstractSVGFaceComponent implements IAnimated {
    private lastEmotion: ISBEEmotion;

    constructor(id: string, private x: number = 0, private y: number = 0,
        private eyeRadiusX: number = DEFAULT_EYE_RADIUS, private eyeRadiusY: number = DEFAULT_EYE_RADIUS) {
        super(id);

        this.properties = [
            (e: ISBEEmotion) => (new EyeOpenessPropertyAdapter()).getPropertyValues(e) // Eyes opennes
        ]
    }

    public setX(x: number) {
        this.x = x;
        this.update({
            cx: x
        });
    }

    public setY(y: number) {
        this.y = y;
        this.update({
            cy: y
        });
    }

    public render(): string {
        return '<ellipse id="' + this.getId() + '" class="eye" cx="' + this.x + '" cy="' + this.y + '" rx="' + this.eyeRadiusX + '" ry="' + this.eyeRadiusY + '"/>';
    }

    public lookAt(p: Point): void {
        // Do nothing
    }

    public onEmotionChanged(e: ISBEEmotion): void {
        let updates = this.computePropertiesUpdates(e);
        console.log(updates);

        this.update(updates);

        this.lastEmotion = e;
    }

    public update(updates: object): void {
        Logger.getInstance().log(Logger.LEVEL.INFO, this);

        updates['targets'] = '#' + this.getId();
        updates['easing'] = 'easeInOutQuart';

        anime(updates);
    }

    public toString(): string {
        return 'Eye (' + this.getId() + '):' + JSON.stringify(this);
    }
}

export class Eyebrow extends AbstractSVGFaceComponent implements IAnimated {

    constructor(id: string, private x: number = 0, private y: number = 0, private width: number = 100.75, private height: number = 30.625,
        public firstControlPoint: Point = new Point(0, 0), public secondControlPoint: Point = new Point(0, 0)) {
        super(id);

        this.properties = [
            (e: ISBEEmotion) => (new EyebrowRotationPropertyAdapter()).getPropertyValues(e) // Eyes opennes
        ];
    }

    public setX(x: number) {
        this.x = x;
    }

    public setY(y: number) {
        this.y = y;
    }

    public render(): string {
        return '<path id="' + this.getId() + '" d="' + this.buildSvgPath() + '" stroke="black" stroke-width="' + this.height + '" fill="transparent"/>';
    }
    public lookAt(p: Point): void { }

    public onEmotionChanged(e: ISBEEmotion): void {
        let updates = this.computePropertiesUpdates(e);
        console.log(updates);

        // TODO: we need to handle better the bezier courve points...
        let fpc = {
            x: this.firstControlPoint.getX(),
            y: this.firstControlPoint.getY()
        }, spc = {
            x: this.secondControlPoint.getX(),
            y: this.secondControlPoint.getY()
        };

        if (updates["firstControlPointX"]) {
            fpc.x = updates["firstControlPointX"];
        }
        if (updates["firstControlPointY"]) {
            fpc.y = updates["firstControlPointY"];
        }
        if (updates["secondControlPointX"]) {
            spc.x = updates["secondControlPointX"];
        }
        if (updates["secondControlPointY"]) {
            spc.y = updates["secondControlPointY"];
        }

        this.firstControlPoint = new Point(fpc.x, fpc.y);
        this.secondControlPoint = new Point(spc.x, spc.y);

        updates['d'] = this.buildSvgPath();

        this.update(updates);
    }

    public update(updates: object): void {
        Logger.getInstance().log(Logger.LEVEL.INFO, this);

        updates['targets'] = '#' + this.getId();
        updates['easing'] = 'easeInOutQuart';

        anime(updates);
    }

    private buildSvgPath(): string {
        return 'M' + this.x + ' ' + this.y + ' C ' + (this.x + this.firstControlPoint.getX()) + ' ' + (this.y + this.firstControlPoint.getY()) + ', ' + (this.x + this.width - this.secondControlPoint.getX()) + ' ' + (this.y + this.secondControlPoint.getY()) + ', ' + (this.x + this.width) + ' ' + this.y
    }
}

export class Mouth extends AbstractSVGFaceComponent implements IAnimated {

    constructor(id: string, private x: number = 0, private y: number = 0, private width: number = 184.0, private height: number = 30.62,
        public firstControlPoint: Point = new Point(0, 0), public secondControlPoint: Point = new Point(0, 0)) {
        super(id);

        this.properties = [
            (e: ISBEEmotion) => (new MouthRotationPropertyAdapter()).getPropertyValues(e) // Eyes opennes
        ];
    }

    public setX(x: number) {
        this.x = x;
    }

    public setY(y: number) {
        this.y = y;
    }

    public render(): string {
        return '<path id="' + this.getId() + '" d="' + this.buildSvgPath() + '" stroke="black" stroke-width="' + this.height + '" fill="transparent"/>';
    }
    public lookAt(p: Point): void { }

    public onEmotionChanged(e: ISBEEmotion): void {
        let updates = this.computePropertiesUpdates(e);
        console.log(updates);

        // TODO: we need to handle better the bezier courve points...
        let fpc = {
            x: this.firstControlPoint.getX(),
            y: this.firstControlPoint.getY()
        }, spc = {
            x: this.secondControlPoint.getX(),
            y: this.secondControlPoint.getY()
        };

        if (updates["firstControlPointX"]) {
            fpc.x = updates["firstControlPointX"];
        }
        if (updates["firstControlPointY"]) {
            fpc.y = updates["firstControlPointY"];
        }
        if (updates["secondControlPointX"]) {
            spc.x = updates["secondControlPointX"];
        }
        if (updates["secondControlPointY"]) {
            spc.y = updates["secondControlPointY"];
        }

        this.firstControlPoint = new Point(fpc.x, fpc.y);
        this.secondControlPoint = new Point(spc.x, spc.y);

        updates['d'] = this.buildSvgPath();

        this.update(updates);
    }

    public update(updates: object): void {
        Logger.getInstance().log(Logger.LEVEL.INFO, this);

        updates['targets'] = '#' + this.getId();
        updates['easing'] = 'easeInOutQuart';

        anime(updates);
    }

    private buildSvgPath(): string {
        return 'M' + this.x + ' ' + this.y + ' C ' + (this.x + this.firstControlPoint.getX()) + ' ' + (this.y + this.firstControlPoint.getY()) + ', ' + (this.x + this.width - this.secondControlPoint.getX()) + ' ' + (this.y + this.secondControlPoint.getY()) + ', ' + (this.x + this.width) + ' ' + this.y
    }
}