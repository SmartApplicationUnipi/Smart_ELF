package elf_kb_protocol;

import com.google.gson.JsonElement;
import com.google.gson.JsonSerializationContext;
import com.google.gson.JsonSerializer;

import java.lang.reflect.Type;

public class KBParamsAdapter implements JsonSerializer<KBParams> {
    @Override
    public JsonElement serialize(KBParams kbParams, Type type, JsonSerializationContext jsonSerializationContext) {
        return kbParams.params;
    }
}
