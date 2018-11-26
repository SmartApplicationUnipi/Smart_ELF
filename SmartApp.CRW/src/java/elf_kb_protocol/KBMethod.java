package elf_kb_protocol;

import com.google.gson.JsonElement;
import com.google.gson.JsonObject;

class KBMethod {
    private String method;
    private JsonElement params;
    private String token;

    public KBMethod(String method, JsonElement params, String token)
    {
        this.method = method;
        this.params = params;
        this.token = token;
    }
}
