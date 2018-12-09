import { KBRule } from "../kb/KBEventReader";
import { ISBEEmotion, ValenceArousalEmotion } from "../emotion/Emotion";

abstract class IBehavior<Input> {


    getEmotion(): ISBEEmotion {
        return new ValenceArousalEmotion(0, 0);
    }

    abstract getFunctionByLabel(label: string): (input: Input) => number;
    abstract getId(): string;
}

function linear(x:number): number {
    return x;
}

class DistanceBehavior extends IBehavior<number> {

    private labelsFunction: object = {
        disgust: (distance: number) => {
            return linear(distance);
        },
        anger: (distance: number) => {
            return linear(distance);
        },
        surprise: (distance: number) => {
            return linear(distance);
        },
        fear: (distance: number) => {
            return linear(distance);
        },
        happiness: (distance: number) => {
            return linear(distance);
        },
        calm: (distance: number) => {
            return linear(distance);
        }
    }

    public getFunctionByLabel(label: string): (distance: number) => number {
        if(!this.labelsFunction[label]) {
            return null;
        }
        return this.labelsFunction[label];
    }

    getId(): string {
        return "distance";
    }
}

export class BehaviorRepository {
    private behaviors: Array<IBehavior<any>> = [];

    public get(id: string) {
        let l = this.behaviors.filter(b => b.getId() == id);
        if(l.length > 0) {
            return l[0];
        }
        return null;
    }

    public getFromObject(obj: object) {
        let keys = Object.keys(obj);
        var x = null, i = 0;
        while(x == null && i < keys.length) {
            x = this.get(keys[i]);
            i++;
        }

        return x;
    }
}

