package elf_kb_protocol;

import com.google.gson.Gson;
import jdk.nashorn.internal.runtime.regexp.joni.exception.ValueException;
import org.eclipse.jetty.websocket.client.ClientUpgradeRequest;
import org.eclipse.jetty.websocket.client.WebSocketClient;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.function.Function;

/**
 * Represents a WebSocket connection to an ELF Knowledge Base.
 * The connection is initialized on object creation but must
 * first be registered by using <code>register()</code>
 * The connection is kept open till the user invokes method
 * <code>closeConnection()</code>. The connection can be
 * reopened at any time with <code>restartConnection()</code>,
 * however notice that a new registration is needed each
 * time a connection is started.
 *
 */
public class KBConnection {

    protected static final int TIMEOUT = 3000;
    private static final int DEFAULT_PORT = 5666;
    private static final String DEFAULT_HOST = "ws://localhost";
    private static final String ADD_FACT_METHOD = "addFact";

    private final Gson gson = new Gson();

    private String host;
    private int port;
    private WebSocketClient client;
    private KBSocket socket;
    private String idSource;

    /**
     * Creates a new KBConnection using the default localhost
     * and the default port (5666)
     * @throws Exception
     */
    public KBConnection() throws Exception {
        this(DEFAULT_HOST, DEFAULT_PORT);
    }

    /**
     * Creates a new KBConnection using supplied host and the
     * default port (5666)
     * @param host the host address to connect to
     * @throws Exception
     */
    public KBConnection(String host) throws Exception
    {
        this(host, DEFAULT_PORT);
    }

    /**
     * Creates a new KBConnection using supplied host and
     * port
     * @param host the host address to connect to
     * @param port the port of the service KB
     * @throws Exception
     */
    public KBConnection(String host, int port) throws Exception {
        this.host = host;
        this.port = port;
        this.startClient();
    }

    private void startClient() throws Exception {
        this.client = new WebSocketClient();
        this.socket = new KBSocket();
        this.client.start();
        ClientUpgradeRequest request = new ClientUpgradeRequest();
        this.client.connect(this.socket, makeUri(this.host, this.port), request);
        this.socket.awaitConnectionOpen();
    }

    /**
     * Gets if this KBConnection is valid. A connection is
     * usually valid when this object was first constructed,
     * unless an exception was thrown during construction
     * and will remain valid till a call to <code>
     * closeConnection()</code>.
     * @return
     */
    public boolean isConnected()
    {
        return this.client.isStarted();
    }

    /**
     * Attempts to restart the WebSocket connection to the KB.
     * Notice that only the connection is started. A call to
     * <code>register()</code> is still needed. This method
     * does nothing if the connection is already valid.
     * @throws Exception
     */
    public void restartConnection() throws Exception {
        if (this.client.isStopped())
            this.startClient();
    }

    /**
     * Closed and existing connection to the KB.
     * @throws Exception
     */
    public void closeConnection() throws Exception {
        this.client.stop();
    }

    /**
     * Registers this connection in the Knowledge Base. Until
     * registration has been made, no operations can be made
     * to the KB.
     * @throws Exception
     */
    public void register() throws Exception {
        if (!this.isConnected())
            return;

        String regJson = "{\"method\": \"register\", \"params\": {}}";
        this.socket.sendString(regJson);
        this.idSource = this.socket.getNextMessage();
    }

    /**
     * Adds a fact to the Knowledge Base. The session ID is
     * automatically supplied by the connection.
     * @param f the fact to add to the KB.
     * @throws Exception
     */
    public void addFact(Fact f) throws Exception {
        if (f.getReliability() < 0 || f.getReliability() > 100)
            throw new ValueException("Fact reliability must be a value between 0 and 100.");

        f.setIdSource(this.idSource);
        String factJson = gson.toJson(new KBMethod(ADD_FACT_METHOD, f));
        System.out.println(factJson);
        this.socket.sendString(factJson);
        this.socket.getNextMessage();
    }

    public void subscribe(String idSource, String jsonReq, Function callback) {

    }

    public void getAndSubscribe(String jsonReq, Function callback) {

    }

    private static URI makeUri(String host, int port) throws URISyntaxException {
        URI uri = new URI(host);
        return new URI(uri.getScheme(), uri.getUserInfo(), uri.getHost(), port,
                uri.getPath(), uri.getQuery(), uri.getFragment());
    }

}
