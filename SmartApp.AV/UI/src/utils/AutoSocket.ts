import * as Logger from '../log/Logger';

const DEFAULT_RECONNECT_DELAY = 5000;

/**
 * AutoSocket is a WebSocket manager that handles reconnection in case of disconnection.
 */
export class AutoSocket {

    /**
     * The underlying socket
     */
    private socket: WebSocket;

    /**
     * Listener to call after events.
     */
    private listener: AutoSocketListener;

    /**
     * If true, AutoSocket should try reconnect
     */
    private reconnectAfterClose: Boolean = true;

    /**
     * Reconnection delay in milliseconds
     */
    private reconnectionDelay: number = DEFAULT_RECONNECT_DELAY;

    constructor(private url: string) { }

    /**
     * Set the listener for this socket
     * @param listener The AutoSocketListener instance
     */
    public setListener(listener: AutoSocketListener): void {
        this.listener = listener;
    }

    /**
     * If true, the socket will try to reconnect after some time, otherwise not.
     * @param b 
     */
    public setReconnectAfterClose(b: boolean): void {
        this.reconnectAfterClose = b;
    }

    /**
     * Set the delay in milliseconds for reconnection of the underlying socket
     * @param delay A number to be used as delay
     */
    public setReconnectionDelay(delay: number) {
        if (delay < 0) {
            throw "invalid_delay";
        }

        this.reconnectionDelay = delay;
    }

    /**
     * Start the socket
     */
    public start() {
        this.prepareSocket(this.url);
    }

    /**
     * Close the underlying socket.
     * After this method call, this object cannot be used no more.
     */
    public close() {
        if(this.socket) {
            this.socket.close();
            this.socket = null;
        }
    }

    /**
     * Send data through the socket
     * @param data The data to be sent
     */
    public send(data: any): void {
        if(!this.socket) {
            throw "socket_closed";
        }
        this.socket.send(data);
    }

    /**
     * Socket close event handler
     * @param event The error event
     */
    private handleSocketClose(event) {
        if (this.reconnectAfterClose) {
            Logger.getInstance().log(Logger.LEVEL.INFO, "AutoSocket: Reconnecting in " + this.reconnectionDelay + " seconds...");

            setTimeout(() => {
                this.prepareSocket(this.url);
            }, this.reconnectionDelay);
        }
    }

    /**
     * Setup a new socket
     * @param url The url that we want to connect
     */
    private prepareSocket(url) {
        this.socket = new WebSocket(url);

        this.socket.onerror = (ev) => {
            Logger.getInstance().log(Logger.LEVEL.ERROR, "AutoSocket: an error occurred", ev);

            if (this.listener) {
                this.listener.onError(ev);
            }

            this.handleSocketClose(ev);
        }

        this.socket.onclose = () => {
            Logger.getInstance().log(Logger.LEVEL.INFO, "AutoSocket: Socket closed...");
            this.socket = null;

            if (this.listener) {
                this.listener.onClose();
            }
        }

        this.socket.onmessage = message => {
            Logger.getInstance().log(Logger.LEVEL.INFO, message);

            if (this.listener) {
                this.listener.onMessage(message.data);
            }
        }

        this.socket.onopen = () => {
            Logger.getInstance().log(Logger.LEVEL.INFO, "AutoSocket: Socket opened...");
            if (this.listener) {
                this.listener.onOpen();
            }
        }
    }
}

export interface AutoSocketListener {
    onMessage(message: any): void;
    onError(error: any): void;
    onClose(): void;
    onOpen(): void;
}