import { EmotionalUIWidget } from '../../../ui/widget/UIWidget';
import { ISBEEmotion, SBEEmotion } from '../../../emotion/Emotion';
import * as Logger from '../../../log/Logger';
import { Point } from '../../../utils/Point';
import { CSSClassHelper } from '../../../utils/CSSClassHelper';
import { Face } from './face/Face';
import { LinearCombiner, Combiner, WeightedMeanCombiner } from '../../../utils/Combiners';

let anime = require("animejs");

export class SVGFace extends Face implements IAnimated {

    private leftEyebrow: SVGFaceComponent;
    private rightEyebrow: SVGFaceComponent;
    private leftEye: SVGFaceComponent;
    private rightEye: SVGFaceComponent;
    private mouth: SVGFaceComponent;

    private components: Array<SVGFaceComponent>;

    private lastLooked: Point;

    constructor(document: Document) {
        super(null);

        this.leftEyebrow = new Eyebrow("leftEyebrow", 108.125, 70.435);
        this.rightEyebrow = new Eyebrow("rightEyebrow", 282.125, 70.435);
        this.leftEye = new Eye("leftEye", 157.651, 175.289);
        this.rightEye = new Eye("rightEye", 332.349, 175.289);
        this.mouth = new Mouth("mouth", 153.125, 317.435);

        this.components = [this.leftEyebrow, this.rightEyebrow, this.leftEye, this.rightEye, this.mouth];

        let e = document.createElement("div");
        e.innerHTML = this.render();
        this.setElement(e.firstElementChild as HTMLElement);

        setTimeout(() => {
            let updates = {
                targets: '#svgface',
                translateY: 10,
                direction: 'alternate',
                easing: 'easeOutSine',
                loop: true
            };

            anime(updates);
        }, 0);
    }

    public lookAt(p: Point): void {
        this.components.forEach(c => c.lookAt(p));

        this.lastLooked = p;
    }

    public onEmotionChanged(e: ISBEEmotion): void {
        Logger.getInstance().log(Logger.LEVEL.INFO, "SVGFace: onEmotionChanged", e);

        this.components.forEach(c => c.onEmotionChanged(e));
    }

    public update(updates: object): void {
        Logger.getInstance().log(Logger.LEVEL.INFO, this);

        updates['targets'] = '.svgface';
        updates['easing'] = 'easeInOutQuart';

        anime(updates);
    }

    public render(): string {
        return '<div id="svgface" class="svgface">\
            <svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"\
                    viewBox="0 0 490 490" style="enable-background:new 0 0 490 490;" xml:space="preserve">\
            <g>\
                ' + this.leftEye.render() + '\
                ' + this.rightEye.render() + '\
                ' + this.mouth.render() + '\
                ' + this.leftEyebrow.render() + '\
                ' + this.rightEyebrow.render() + '\
                <path d="M69.086,490h351.829C459.001,490,490,459.001,490,420.914V69.086C490,30.991,459.001,0,420.914,0H69.086\
                    C30.991,0,0,30.991,0,69.086v351.829C0,459.001,30.991,490,69.086,490z M30.625,69.086c0-21.204,17.257-38.461,38.461-38.461\
                    h351.829c21.204,0,38.461,17.257,38.461,38.461v351.829c0,21.204-17.257,38.461-38.461,38.461H69.086\
                    c-21.204,0-38.461-17.257-38.461-38.461V69.086z"/>\
            </g>\
            </svg>\
        </div>';
    }
}

/**
 * <ellipse class="eye" cx="157.651" cy="175.289" rx="42.642" ry="42.642"/>\
                <ellipse class="eye" cx="332.349" cy="175.289" rx="42.642" ry="42.642"/>\
                <rect class="mouth" x="153.125" y="317.435" width="183.75" height="30.625"/>\
                <rect class="eyebrow" x="108.125" y="70.435" width="100.75" height="30.625"/>\
                <rect class="eyebrow" x="282.125" y="70.435" width="100.75" height="30.625"/>\
                <path d="M69.086,490h351.829C459.001,490,490,459.001,490,420.914V69.086C490,30.991,459.001,0,420.914,0H69.086\
                    C30.991,0,0,30.991,0,69.086v351.829C0,459.001,30.991,490,69.086,490z M30.625,69.086c0-21.204,17.257-38.461,38.461-38.461\
                    h351.829c21.204,0,38.461,17.257,38.461,38.461v351.829c0,21.204-17.257,38.461-38.461,38.461H69.086\
                    c-21.204,0-38.461-17.257-38.461-38.461V69.086z"/>\
 */

interface IAnimated {
    update(updates: object): void;
}

abstract class SVGFaceComponent {

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

abstract class PropertyAdapter {
    public getPropertyValues(emotion: ISBEEmotion): object {
        let values: Array<{ alpha: number, value: object }> = [
            { alpha: emotion.getSadness(), value: this.sadness(emotion.getSadness()) },
            { alpha: emotion.getDisgust(), value: this.disgust(emotion.getDisgust()) },
            { alpha: emotion.getAnger(), value: this.anger(emotion.getAnger()) },
            { alpha: emotion.getSurprise(), value: this.surprise(emotion.getSurprise()) },
            { alpha: emotion.getFear(), value: this.fear(emotion.getFear()) },
            { alpha: emotion.getHappiness(), value: this.happiness(emotion.getHappiness()) }
        ];

        let combiners = values.reduce((dict, val) => {
            Object.keys(val.value).map(property => {
                if (!dict[property]) {
                    dict[property] = new WeightedMeanCombiner(); // TODO: Let the concrete class choose the Combiner
                }

                dict[property].set({ weight: val.alpha, element: val.value[property] });
            });

            return dict;
        }, {});

        Object.keys(combiners).forEach(key => {
            combiners[key] = combiners[key].result();
        })

        return combiners;
    }

    abstract sadness(sadness: number): object;
    abstract disgust(disgust: number): object;
    abstract anger(anger: number): object;
    abstract surprise(surprise: number): object;
    abstract fear(fear: number): object;
    abstract happiness(happiness: number): object;
}

class EyeOpenessPropertyAdapter extends PropertyAdapter {

    sadness(sadness: number): object {
        return { ry: 10 }
    }

    disgust(disgust: number): object {
        return {
            ry: 12
        };
    }

    anger(anger: number): object {
        return {
            ry: 22
        };
    }

    surprise(surprise: number): object {
        return {
            ry: 54
        };
    }

    fear(fear: number): object {
        return {
            ry: 30
        };
    }

    happiness(happiness: number): object {
        return {
            ry: 54
        };
    }
}

const DEFAULT_EYE_RADIUS = 42.64;

class Eye extends SVGFaceComponent implements IAnimated {
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

class EyebrowRotationPropertyAdapter extends PropertyAdapter {

    sadness(sadness: number): object {
        return {
            firstControlPointX: 10,
            firstControlPointY: 10,
            secondControlPointX: 10,
            secondControlPointY: 10
        };
    }

    disgust(disgust: number): object {
        return {

        };
    }

    anger(anger: number): object {
        return {
        };
    }

    surprise(surprise: number): object {
        return {
            firstControlPointX: 10,
            firstControlPointY: -10,
            secondControlPointX: 10,
            secondControlPointY: -10
        };
    }

    fear(fear: number): object {
        return {};
    }

    happiness(happiness: number): object {
        return {
            firstControlPointX: 10,
            firstControlPointY: -10,
            secondControlPointX: 10,
            secondControlPointY: -10
        };
    }
}


class Eyebrow extends SVGFaceComponent implements IAnimated {

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

class MouthRotationPropertyAdapter extends PropertyAdapter {

    sadness(sadness: number): object {
        return {
            firstControlPointX: 10,
            firstControlPointY: -50,
            secondControlPointX: 10,
            secondControlPointY: -50
        };
    }

    disgust(disgust: number): object {
        return {

        };
    }

    anger(anger: number): object {
        return {
        };
    }

    surprise(surprise: number): object {
        return {
            firstControlPointX: 10,
            firstControlPointY: 20,
            secondControlPointX: 10,
            secondControlPointY: 20
        };
    }

    fear(fear: number): object {
        return {};
    }

    happiness(happiness: number): object {
        return {
            firstControlPointX: 10,
            firstControlPointY: 50,
            secondControlPointX: 10,
            secondControlPointY: 50
        };
    }
}

class Mouth extends SVGFaceComponent implements IAnimated {

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