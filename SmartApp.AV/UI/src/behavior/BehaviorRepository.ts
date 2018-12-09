import { ISBEEmotion, ValenceArousalEmotion, SBEEmotion } from "../emotion/Emotion";
import * as Logger from '../log/Logger';

export abstract class IBehavior<Input> {
    getEmotion(input: Input): ISBEEmotion {
        return new ValenceArousalEmotion(0, 0);
    }

    abstract getFunctionByLabel(label: string): (input: Input) => number;
    abstract getId(): string;
}

function linear(x:number): number {
    return x;
}

export class DefensiveBehavior extends IBehavior<number> {
    /**
     * Functions that compute a value for each of the labels which indicates
     * how much the behavior modify the emotion of the face.
     * Fuzzy logic is used to get that value.
     */
    private labelsFunction: object = {
        disgust: linear,
        anger: linear,
        surprise: linear,
        fear: linear,
        happiness: linear,
        calm: linear,
        sadness: linear
    }

    public getFunctionByLabel(label: string): (distance: number) => number {
        if(!this.labelsFunction[label]) {
            Logger.getInstance().log(Logger.LEVEL.ERROR, "cannot find function for label", label);
            return (x) => x;
        }
        return this.labelsFunction[label];
    }

    public getEmotion(value: number): ISBEEmotion {
        let val = value['defensive'];
        return new SBEEmotion(
            this.getFunctionByLabel("sadness")(val),
            this.getFunctionByLabel("disgust")(val),
            this.getFunctionByLabel("anger")(val),
            this.getFunctionByLabel("surprise")(val),
            this.getFunctionByLabel("fear")(val),
            this.getFunctionByLabel("happiness")(val),
            this.getFunctionByLabel("calm")(val),
            val
        )
    }

    getId(): string {
        return "defensive";
    }
}

export class BehaviorRepository {
    private behaviors: Array<IBehavior<any>> = [
        new DefensiveBehavior()
    ];

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

