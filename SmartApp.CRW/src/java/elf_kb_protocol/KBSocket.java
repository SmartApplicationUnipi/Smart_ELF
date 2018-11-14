package elf_kb_protocol;

import org.eclipse.jetty.websocket.api.RemoteEndpoint;
import org.eclipse.jetty.websocket.api.Session;
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketClose;
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketConnect;
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketMessage;
import org.eclipse.jetty.websocket.api.annotations.WebSocket;

import java.io.IOException;
import java.net.SocketTimeoutException;
import java.util.concurrent.*;

@WebSocket(maxTextMessageSize = 64 * 1024)
public class KBSocket {

    private CountDownLatch connectionOpenLatch = new CountDownLatch(1);
    @SuppressWarnings("unused")
    private Session session;
    private BlockingQueue<String> messageQueue;

    public KBSocket() throws Exception {

        this.connectionOpenLatch = new CountDownLatch(1);
        this.messageQueue = new LinkedBlockingQueue<>();
    }

    @OnWebSocketClose
    public void onClose(int statusCode, String reason) {
        //System.out.printf("Connection closed: %d - %s%n", statusCode, reason);
        this.session = null;
    }

    @OnWebSocketConnect
    public void onConnect(Session session) {
        this.session = session;
        this.connectionOpenLatch.countDown();
    }

    @OnWebSocketMessage
    public void onMessage(String msg) {
        System.out.printf("Got msg: %s%n", msg);
        this.messageQueue.add(msg);
    }

    public boolean hasMessages(){
        return this.messageQueue.size() > 0;
    }

    public String getNextMessage() throws InterruptedException {
        return this.messageQueue.take();
    }

    public void sendString(String str) throws IOException {
        this.getRemote().sendString(str);
    }

    public RemoteEndpoint getRemote()
    {
        return this.session.getRemote();
    }

    public boolean awaitConnectionOpen(int duration, TimeUnit unit) throws InterruptedException
    {
        return this.connectionOpenLatch.await(duration, unit);
    }

    public void awaitConnectionOpen() throws InterruptedException, SocketTimeoutException {
        boolean timedout = !this.connectionOpenLatch.await(KBConnection.TIMEOUT, TimeUnit.MILLISECONDS);
        if (timedout)
            throw new SocketTimeoutException();
    }

}
