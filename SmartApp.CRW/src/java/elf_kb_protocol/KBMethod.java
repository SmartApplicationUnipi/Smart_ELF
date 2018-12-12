package elf_kb_protocol;

import com.google.gson.Gson;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;

import java.util.List;

class KBMethod {
    private String idSource;
    private String method;
    private JsonObject params;
    private String token;

    public KBMethod(String idSource, String method, String token)
    {
        this.idSource = idSource;
        this.method = method;
        this.params = buildParams();
        this.token = token;
    }

    public void addParameter(String paramName, JsonElement e)
    {
        this.params.add(paramName, e);
    }

    public void addParameter(String paramName, String s)
    {
        this.params.addProperty(paramName, s);
    }

    public void addParameter(String paramName, Character c)
    {
        this.params.addProperty(paramName, c);
    }

    public void addParameter(String paramName, Number n)
    {
        this.params.addProperty(paramName, n);
    }

    public void addParameter(String paramName, Boolean b)
    {
        this.params.addProperty(paramName, b);
    }

    private JsonObject buildParams()
    {
        JsonObject a = new JsonObject();
        a.addProperty(KBConnection.ID_SOURCE_PARAM, this.idSource);

        return a;
    }

    public String getIdSource() {
        return idSource;
    }

    public String getMethod() {
        return method;
    }

    public JsonObject getParams() {
        return params;
    }

    public String getToken() {
        return token;
    }
}
