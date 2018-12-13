import { AbstractSVGFaceComponent } from "./AbstractSVGFaceComponent";
import { IAnimated } from "../IAnimated";
import { ISBEEmotion } from "../../../../../emotion/Emotion";
import { EyeOpenessPropertyAdapter, EyebrowRotationPropertyAdapter, MouthRotationPropertyAdapter, EyebrowPositionPropertyAdapter, MouthPositionPropertyAdapter } from "../property/SVGFaceAdapters";
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
            (e: ISBEEmotion) => (new EyeOpenessPropertyAdapter()).getPropertyValues(e)
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

    private _leftAnchorPoint: Point;
    private _rightAnchorPoint: Point;
    private _firstControlPoint: Point;
    private _secondControlPoint: Point;

    constructor(id: string, private height: number = 30.625,
        public leftAnchorPoint: Point = new Point(0, 0), public rightAnchorPoint: Point = new Point(100.75, 0),
        public firstControlPoint: Point = new Point(0, 0), public secondControlPoint: Point = new Point(0, 0), public specular: boolean = false) {
        super(id);

        this._leftAnchorPoint = leftAnchorPoint;
        this._rightAnchorPoint = rightAnchorPoint;
        this._firstControlPoint = firstControlPoint;
        this._secondControlPoint = secondControlPoint;

        this.properties = [
            (e: ISBEEmotion) => (new EyebrowRotationPropertyAdapter(this)).getPropertyValues(e),
            (e: ISBEEmotion) => (new EyebrowPositionPropertyAdapter()).getPropertyValues(e)
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

        // TODO: we need to handle better the bezier courve points...
        let lp = {
            x: 0,
            y: 0
        }, rp = {
            x: 0,
            y: 0
        };
        let fpc = {
            x: 0,
            y: 0
        }, spc = {
            x: 0,
            y: 0
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

        this._leftAnchorPoint = this.leftAnchorPoint.add(new Point(lp.x, lp.y));
        this._rightAnchorPoint = this.rightAnchorPoint.add(new Point(rp.x, rp.y));
        this._firstControlPoint = this.firstControlPoint.add(new Point(fpc.x, fpc.y));
        this._secondControlPoint = this.secondControlPoint.add(new Point(spc.x, spc.y));

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
        return 'M' + this._leftAnchorPoint.getX() + ' ' + this._leftAnchorPoint.getY() + 
              ' C ' + (this._leftAnchorPoint.getX() + this._firstControlPoint.getX()) + 
              ' ' + (this._leftAnchorPoint.getY() + this._firstControlPoint.getY()) + 
              ', ' + (this._rightAnchorPoint.getX() + this._secondControlPoint.getX()) + 
              ' ' + (this._rightAnchorPoint.getY() + this._secondControlPoint.getY()) + 
              ', ' + this._rightAnchorPoint.getX() + ' ' + this._rightAnchorPoint.getY()
    }
}

export class Mouth extends AbstractSVGFaceComponent implements IAnimated {

    private _leftAnchorPoint: Point;
    private _rightAnchorPoint: Point;
    private _firstControlPoint: Point;
    private _secondControlPoint: Point;

    constructor(id: string, private height: number = 30.62,
        public leftAnchorPoint: Point = new Point(0, 0), public rightAnchorPoint: Point = new Point(180.00, 0),
        public firstControlPoint: Point = new Point(0, 0), public secondControlPoint: Point = new Point(0, 0)) {
        super(id);

        this._leftAnchorPoint = leftAnchorPoint;
        this._rightAnchorPoint = rightAnchorPoint;
        this._firstControlPoint = firstControlPoint;
        this._secondControlPoint = secondControlPoint;

        this.properties = [
            (e: ISBEEmotion) => (new MouthRotationPropertyAdapter()).getPropertyValues(e),
            (e: ISBEEmotion) => (new MouthPositionPropertyAdapter()).getPropertyValues(e)
        ];
    }

    public setX(x: number) { }

    // Set the y diff from the location
    public setY(y: number) { }

    public render(): string {
        return '<path id="' + this.getId() + '" d="' + this.buildSvgPath() + '" stroke="black" stroke-width="' + this.height + '" fill="transparent"/>';
    }
    public lookAt(p: Point): void { }

    public onEmotionChanged(e: ISBEEmotion): void {
        let updates = this.computePropertiesUpdates(e);

        // TODO: we need to handle better the bezier courve points...
        let lp = {
            x: 0,
            y: 0
        }, rp = {
            x: 0,
            y: 0
        };
        let fpc = {
            x: 0,
            y: 0
        }, spc = {
            x: 0,
            y: 0
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

        this._leftAnchorPoint = this.leftAnchorPoint.add(new Point(lp.x, lp.y));
        this._rightAnchorPoint = this.rightAnchorPoint.add(new Point(rp.x, rp.y));
        this._firstControlPoint = this.firstControlPoint.add(new Point(fpc.x, fpc.y));
        this._secondControlPoint = this.secondControlPoint.add(new Point(spc.x, spc.y));

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
        return 'M' + this._leftAnchorPoint.getX() + ' ' + this._leftAnchorPoint.getY() + 
              ' C ' + (this._leftAnchorPoint.getX() + this._firstControlPoint.getX()) + 
              ' ' + (this._leftAnchorPoint.getY() + this._firstControlPoint.getY()) + 
              ', ' + (this._rightAnchorPoint.getX() + this._secondControlPoint.getX()) + 
              ' ' + (this._rightAnchorPoint.getY() + this._secondControlPoint.getY()) + 
              ', ' + this._rightAnchorPoint.getX() + ' ' + this._rightAnchorPoint.getY()
    }
}