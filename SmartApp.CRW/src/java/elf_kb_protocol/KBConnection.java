package elf_kb_protocol;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonElement;
import org.eclipse.jetty.websocket.client.ClientUpgradeRequest;
import org.eclipse.jetty.websocket.client.WebSocketClient;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.function.Function;

/**
 * Represents a WebSocket connection to an ELF Knowledge Base.
 * The connection is initialized on object creation but must
 * first be registered by using <code>registerTags()</code>
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
    protected static final String ID_SOURCE_PARAM = "idSource";
    private static final String ADD_FACT_METHOD = "addFact";
    private static final String REGISTER_METHOD = "register";
    private static final String REGISTER_TAGS_METHOD = "registerTags";
    private static final String REGISTER_TAGS_PARAM = "tagsList";
    private static final String DEFAULT_TOKEN = "smartapp1819";

    private static final GsonBuilder gsonBuilder = (new GsonBuilder())
            .registerTypeAdapter(TagList.class, new JReqAdapter())
            .registerTypeAdapter(KBMethod.class, new KBMethodAdapter());
    private static final Gson gson = gsonBuilder.create();


    private String host;
    private int port;
    private WebSocketClient client;
    private KBSocket socket;
    private String idSource;
    private TagList jreq;

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
     * Creates a new KBConnection using the supplied port and
     * the default localhost
     * @param port the port of the service KB
     * @throws Exception
     */
    public KBConnection(int port) throws Exception
    {
        this(DEFAULT_HOST, port);
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
        register();
    }

    private void register() throws Exception {

        KBMethod m = new KBMethod(this.idSource, REGISTER_METHOD, DEFAULT_TOKEN);

        String methodJson = gson.toJson(new KBMethod(this.idSource, REGISTER_METHOD, DEFAULT_TOKEN));
        KBReply r = toReply(this.socket.sendString(methodJson));

        if (!r.isSuccess())
            this.closeConnection();

        this.idSource = (String)r.getDetails();
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
     * <code>registerTags()</code> is still needed. This method
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
     * registration has been made, no operations can be madeTags
     * to the KB.
     * @throws Exception
     */
    public void registerTags(TagList tag) throws Exception {
        if (!this.isConnected())
            throw new Exception("Client is not connected to a KB.");

        KBMethod m = new KBMethod(this.idSource, REGISTER_TAGS_METHOD, DEFAULT_TOKEN);
        m.addParameter(REGISTER_TAGS_PARAM, gson.toJsonTree(tag, TagList.class));

        KBReply r = toReply(this.socket.sendString(gson.toJson(m)));
        if (!r.isSuccess())
        {
            closeConnection();
            throw new Exception(String.format("Could not register tags to KB: %s", r.getDetails()));
        }

        this.jreq = tag;
    }

    /**
     * Adds a fact to the Knowledge Base. The session ID is
     * automatically supplied by the connection.
     * @param f the fact to add to the KB.
     * @throws Exception
     */
    public KBReply addFact(Fact f) throws Exception {
        if (!this.isConnected())
            throw new Exception("Client is not connected to a KB.");

        if (f.getReliability() < 0 || f.getReliability() > 100)
            throw new Exception("Fact reliability must be a value between 0 and 100.");

        if (!this.jreq.containsTag(f.getTag()))
            throw new Exception(String.format("Tag '%s' has not been registered on the connection.", f.getTag()));

        KBMethod m = new KBMethod(this.idSource, ADD_FACT_METHOD, DEFAULT_TOKEN);
        m.addParameter("tag", f.getTag());
        m.addParameter("reliability", f.getReliability());
        m.addParameter("TTL", f.getTTL().ordinal());

        JsonElement fact = gson.toJsonTree(f.getJsonFact());
        m.addParameter("jsonFact", fact);

        String response = this.socket.sendString(gson.toJson(m));
        if (response == null)
            return null;

        return gson.fromJson(response, KBReply.class);
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

    private static KBReply toReply(String json)
    {
        return gson.fromJson(json, KBReply.class);
    }

}
