package elf_crawler.relationship;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.reflect.TypeToken;
import com.google.gson.stream.JsonReader;
import elf_crawler.CrawlerAddress;

import java.io.FileNotFoundException;
import java.io.FileReader;
import java.lang.reflect.Type;
import java.util.List;
import java.util.Map;

public class RelationshipSet {

    private static final Type RELATIONSHIP_SET_TYPE =
            new TypeToken<Map<String, List<RelationQuery>>>(){}.getType();
    private static final String GENERIC_RELATIONSHIP_SET = "generic";

    private static Gson gson = new GsonBuilder()
            .registerTypeAdapter(RelationQuery.class, new RelationQueryDeserializer())
            .create();
    private Map<String, List<RelationQuery>> relationships;

    public RelationshipSet(String jsonFilename) throws FileNotFoundException {
        JsonReader reader = new JsonReader(new FileReader(jsonFilename));
        this.relationships = gson.fromJson(reader, RELATIONSHIP_SET_TYPE);
    }

    public RelationshipSet(Map<String, List<RelationQuery>> relationships)
    {
        this.relationships = relationships;
    }

    public List<RelationQuery> getWebsiteRelations(CrawlerAddress l)
    {
        List<RelationQuery> rel = this.relationships.get(l.getUnprocessedUrl());
        
        if (rel == null)
            rel = this.relationships.get(GENERIC_RELATIONSHIP_SET);

        return rel;
    }
}
