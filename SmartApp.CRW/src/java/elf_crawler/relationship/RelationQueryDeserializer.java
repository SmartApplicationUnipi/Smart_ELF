package elf_crawler.relationship;

import com.google.gson.*;
import com.google.gson.reflect.TypeToken;
import elf_crawler.crawler.Tag;

import java.lang.reflect.Type;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;

public class RelationQueryDeserializer implements JsonDeserializer<RelationQuery> {

    private static final String CSV_ALL_COLUMNS = "*";
    private static final Type LIST_STRING_TYPE =
            new TypeToken<List<String>>(){}.getType();

    @Override
    public RelationQuery deserialize(JsonElement jsonElement, Type type, JsonDeserializationContext jsonDeserializationContext) throws JsonParseException {

        JsonObject o = jsonElement.getAsJsonObject();
        String tag = o.get("tag").getAsString();

        if (o.has("columns"))
        {
            String columnsStr = o.get("columns").getAsString();

            if (columnsStr.equals(CSV_ALL_COLUMNS))
                return new CSVRelation(tag, Collections.emptyList());

            List<String> columns = Arrays.asList(columnsStr.split(","));
            return new CSVRelation(tag, columns);
        }
        if (o.has("root"))
        {
            String root = o.get("root").getAsString();

            return new JsonPathRelation(tag, root);
        }
        if (o.has("predicate"))
        {
            // RDF Triple
            String predicate = o.get("predicate").getAsString();
            String subject = o.get("subject").getAsString();
            String object = o.get("object").getAsString();
            String groupby = o.get("groupby").getAsString();

            return new RdfRelation(tag, predicate, subject, object, groupby);
        }

        return null;
    }
}
