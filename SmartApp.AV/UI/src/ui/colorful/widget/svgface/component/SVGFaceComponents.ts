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

    constructor(id: string, private location: Point = new Point(0, 0),
        private eyeRadiusX: number = DEFAULT_EYE_RADIUS, private eyeRadiusY: number = DEFAULT_EYE_RADIUS) {
        super(id);

        this.properties = [
            (e: ISBEEmotion) => (new EyeOpenessPropertyAdapter()).getPropertyValues(e) // Eyes opennes
        ]
    }

    // Set the  x diff from the location
    public setX(x: number) {
        this.update({
            cx: this.location.getX() + x
        });
    }

    // Set the y diff from the location
    public setY(y: number) {
        this.update({
            cy: this.location.getY() + y
        });
    }

    public render(): string {
        return '<ellipse id="' + this.getId() + '" class="eye" cx="' + this.location.getX() + '" cy="' + this.location.getY() + '" rx="' + this.eyeRadiusX + '" ry="' + this.eyeRadiusY + '"/>';
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

    constructor(id: string, private height: number = 30.625,
        public leftAnchorPoint: Point = new Point(0, 0), public rightAnchorPoint: Point = new Point(100.75, 0),
        public firstControlPoint: Point = new Point(0, 0), public secondControlPoint: Point = new Point(0, 0), public specular: boolean = false) {
        super(id);

        this.properties = [
            (e: ISBEEmotion) => (new EyebrowRotationPropertyAdapter(this)).getPropertyValues(e) // Eyes opennes
        ];
    }

    public setX(x: number) {
    }

    public setY(y: number) {
    }

    public render(): string {
        return '<path id="' + this.getId() + '" d="' + this.buildSvgPath() + '" stroke="black" stroke-width="' + this.height + '" fill="transparent"/>';
    }
    public lookAt(p: Point): void { }

    public onEmotionChanged(e: ISBEEmotion): void {
        let updates = this.computePropertiesUpdates(e);
        console.log(updates);

        // TODO: we need to handle better the bezier courve points...
        let lp = {
            x: this.leftAnchorPoint.getX(),
            y: this.leftAnchorPoint.getY()
        }, rp = {
            x: this.rightAnchorPoint.getX(),
            y: this.rightAnchorPoint.getY()
        };
        let fpc = {
            x: this.firstControlPoint.getX(),
            y: this.firstControlPoint.getY()
        }, spc = {
            x: this.secondControlPoint.getX(),
            y: this.secondControlPoint.getY()
        };

        // Control points
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

        // Anchor points
        if (updates["x1"]) {
            lp.x = updates["x1"];
        }
        if (updates["y1"]) {
            lp.y = updates["y1"];
        }
        if (updates["x2"]) {
            rp.x = updates["x2"];
        }
        if (updates["y2"]) {
            rp.y = updates["y2"];
        }

        this.firstControlPoint = new Point(fpc.x, fpc.y);
        this.secondControlPoint = new Point(spc.x, spc.y);
        this.leftAnchorPoint = new Point(lp.x, lp.y);
        this.rightAnchorPoint = new Point(rp.x, rp.y);

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
        return 'M' + this.leftAnchorPoint.getX() + ' ' + this.leftAnchorPoint.getY() + ' C ' + (this.leftAnchorPoint.getX() + this.firstControlPoint.getX()) + ' ' + (this.leftAnchorPoint.getY() + this.firstControlPoint.getY()) + ', ' + (this.rightAnchorPoint.getX() + this.secondControlPoint.getX()) + ' ' + (this.rightAnchorPoint.getY() + this.secondControlPoint.getY()) + ', ' + this.rightAnchorPoint.getX() + ' ' + this.rightAnchorPoint.getY()
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