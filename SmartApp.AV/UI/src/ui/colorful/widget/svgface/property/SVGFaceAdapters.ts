import { PropertyAdapter } from "./PropertyAdapter";
import { Eyebrow } from "../component/SVGFaceComponents";

export class EyeOpenessPropertyAdapter extends PropertyAdapter {

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
            ry: 6
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

export class EyebrowRotationPropertyAdapter extends PropertyAdapter {

    constructor(private eyebrow: Eyebrow) {
        super();
    }

    sadness(sadness: number): object {
        return {
            firstControlPointX: 10,
            firstControlPointY: 10,
            secondControlPointX: -10,
            secondControlPointY: 10
        };
    }

    disgust(disgust: number): object {
        return {
            firstControlPointX: 10,
            firstControlPointY: 10,
            secondControlPointX: -10,
            secondControlPointY: -10
        };
    }

    anger(anger: number): object {
        return {

        };
    }

    surprise(surprise: number): object {
        return {
            firstControlPointX: 10,
            firstControlPointY: -60,
            secondControlPointX: -10,
            secondControlPointY: -60
        };
    }

    fear(fear: number): object {
        return {
            // TODO: needs of the start and end positions
        };
    }

    happiness(happiness: number): object {
        return {
            firstControlPointX: 10,
            firstControlPointY: -10,
            secondControlPointX: -10,
            secondControlPointY: -10
        };
    }
}

export class MouthRotationPropertyAdapter extends PropertyAdapter {

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
            firstControlPointX: 0,
            firstControlPointY: 10,
            secondControlPointX: 0,
            secondControlPointY: -10
        };
    }

    anger(anger: number): object {
        return {
            firstControlPointX: 0,
            firstControlPointY: 0,
            secondControlPointX: 0,
            secondControlPointY: 0
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
        return {
            firstControlPointX: 0,
            firstControlPointY: 10,
            secondControlPointX: 0,
            secondControlPointY: 10
        };
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

