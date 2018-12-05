import { ISBEEmotion } from '../../../../emotion/Emotion';
import * as Logger from '../../../../log/Logger';
import { Point } from '../../../../utils/Point';
import { Face } from '../face/Face';
import { IAnimated } from './IAnimated';
import { AbstractSVGFaceComponent } from './component/AbstractSVGFaceComponent'
import { Eye, Eyebrow, Mouth } from './component/SVGFaceComponents';

let anime = require("animejs");

export class SVGFace extends Face implements IAnimated {

    private leftEyebrow: AbstractSVGFaceComponent;
    private rightEyebrow: AbstractSVGFaceComponent;
    private leftEye: AbstractSVGFaceComponent;
    private rightEye: AbstractSVGFaceComponent;
    private mouth: AbstractSVGFaceComponent;

    private components: Array<AbstractSVGFaceComponent>;

    private lastLooked: Point;

    constructor(document: Document) {
        super(null);

        let wpoint = new Point(100.75, 0); // width
        let lanchor1 = new Point(108.125, 70.435);
        let ranchor1 = lanchor1.add(wpoint);
        let lct1 = new Point(10, 0);
        let rct1 = new Point(-10, 0);

        //let rbase = new Point(282.125, 70.435);
        let diff = new Point(182.125, 0);
        let lanchor2 = lanchor1.add(diff);
        let ranchor2 = ranchor1.add(diff);
        let lct2 = lct1;
        let rct2 = rct1;

        this.leftEyebrow = new Eyebrow("leftEyebrow", 30.625, 
            lanchor1, ranchor1, 
            lct1, rct1
        );
        // this.rightEyebrow = new Eyebrow("rightEyebrow", 30.625, lanchor2, rbase.add(new Point(100.75, 0)), rbase.add(new Point(10, 10)), rbase.add(new Point(100.75, 0)));
        this.rightEyebrow = new Eyebrow("rightEyebrow", 30.625, lanchor2, ranchor2, lct2, rct2, true);
        this.leftEye = new Eye("leftEye", new Point(157.651, 175.289));
        this.rightEye = new Eye("rightEye", new Point(332.349, 175.289));
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
        let majorEye = this.rightEye, minorEye = this.leftEye;

        if (p.getX() < 0) {
            majorEye = this.leftEye;
            minorEye = this.rightEye;
        }

        let minorUpdates = {
            x: p.getX() * 30,
            y: p.getY() * 30
        };

        minorEye.setX(minorUpdates.x);
        minorEye.setY(minorUpdates.y);

        majorEye.setX(minorUpdates.x);
        majorEye.setY(minorUpdates.y);

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