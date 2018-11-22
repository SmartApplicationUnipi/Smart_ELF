package elf_kb_protocol;

import com.google.gson.JsonElement;
import com.google.gson.JsonSerializationContext;
import com.google.gson.JsonSerializer;

import java.lang.reflect.Type;

public class JReqAdapter implements JsonSerializer<JReq> {

    @Override
    public JsonElement serialize(JReq t, Type typeOfSrc,
                                 JsonSerializationContext context) {

        return t.getTags();
    }
}