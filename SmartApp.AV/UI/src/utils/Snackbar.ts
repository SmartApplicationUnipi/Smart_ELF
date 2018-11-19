//import PNotify from '../../node_modules/pnotify/dist/es/PNotify.js';
var PNotify = require('pnotify/dist/umd/PNotify.js');
var PNotifyStyleMaterial = require('pnotify/dist/umd/PNotifyStyleMaterial.js');

/**
 * Class that handles snackbar message prompting.
 */
export class Snackbar {
    /**
     * Delay for hiding notices
     */
    private delay: DELAY;

    /**
     * Pnotify stack options
     */
    private stack: object = {
        'dir1': 'up',
        'dir2': 'left',
        'firstpos1': 25,
        'firstpos2': 25,
        'push': 'top'
    };

    constructor() {
        this.delay = DELAY.SHORT;

        // Material theme
        PNotify.defaults.styling = 'material';
        PNotify.defaults.icons = 'material';
    }

    /**
     * Set the snackbar delay
     */
    public setDelay(delay: DELAY = DELAY.SHORT) {
        this.delay = delay;
    }

    /**
     * Shows a message containing message as text
     * @param message The message to be reported
     */
    public showText(message: string): void {
        PNotify.alert({
            icon: false,
            text: message,
            delay: this.delay,
            styling: {},
            addClass: 'custom',
            stack: this.stack
        });
    }
}

export enum DELAY {
    LONG = 5000,
    SHORT = 2000
}