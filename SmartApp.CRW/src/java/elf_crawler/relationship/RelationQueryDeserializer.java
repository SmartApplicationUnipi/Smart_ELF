package elf_crawler.relationship;

import com.google.gson.*;

import java.lang.reflect.Type;

public class RelationQueryDeserializer implements JsonDeserializer<RelationQuery> {

    @Override
    public RelationQuery deserialize(JsonElement jsonElement, Type type, JsonDeserializationContext jsonDeserializationContext) throws JsonParseException {
        if (jsonElement.isJsonPrimitive())
            return new JsonPathRelation(jsonElement.getAsString());

        JsonObject o = jsonElement.getAsJsonObject();
        if (o.has("predicate"))
        {
            // RDF Triple
            String predicate = o.get("predicate").getAsString();
            String subject = o.get("subject").getAsString();
            String object = o.get("object").getAsString();
            String groupby = o.get("groupby").getAsString();

            return new RdfRelation(predicate, subject, object, groupby);
        }

        return null;
    }
}
