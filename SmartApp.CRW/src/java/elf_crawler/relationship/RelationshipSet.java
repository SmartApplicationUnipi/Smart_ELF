package elf_crawler.relationship;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.google.gson.stream.JsonReader;

import java.io.FileNotFoundException;
import java.io.FileReader;
import java.lang.reflect.Type;
import java.util.List;
import java.util.Map;

public class RelationshipSet {

    private static final Type RELATIONSHIP_SET_TYPE =
            new TypeToken<Map<String, List<Relation>>>(){}.getType();
    private static final String GENERIC_RELATIONSHIP_SET = "generic";

    private static Gson gson = new Gson();
    private Map<String, List<Relation>> relationships;

    public RelationshipSet(String jsonFilename) throws FileNotFoundException {
        JsonReader reader = new JsonReader(new FileReader(jsonFilename));
        this.relationships = gson.fromJson(reader, RELATIONSHIP_SET_TYPE);
    }

    public RelationshipSet(Map<String, List<Relation>> relationships)
    {
        this.relationships = relationships;
    }

    public List<Relation> getWebsiteRelations(String url)
    {
        List<Relation> rel = this.relationships.get(url);
        
        if (rel == null)
            rel = this.relationships.get(GENERIC_RELATIONSHIP_SET);

        return rel;
    }
}
