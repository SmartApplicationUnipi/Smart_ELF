package elf_kb_protocol;


import com.google.gson.Gson;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;

public class KBParams  {

    private static final Gson gson = new Gson();
    protected JsonObject params;


    public KBParams(){
        this.params = new JsonObject();
    }

    public void addParameter(String parameter, Object value)
    {
        JsonElement e = gson.toJsonTree(value);
        this.params.add(parameter, e);
    }

}
