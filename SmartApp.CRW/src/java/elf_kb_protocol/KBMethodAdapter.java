package elf_kb_protocol;

import com.google.gson.*;
import elf_crawler.relationship.RelationQuery;

import java.lang.reflect.Type;

public class KBMethodAdapter implements JsonSerializer<KBMethod> {

    @Override
    public JsonElement serialize(KBMethod method, Type type, JsonSerializationContext jsonSerializationContext) {
        JsonObject o = new JsonObject();
        o.addProperty("method", method.getMethod());
        o.add("params", method.getParams());
        o.addProperty("token", method.getToken());

        return o;
    }
}
