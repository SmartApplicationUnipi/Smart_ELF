package elf_crawler.crawler;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.google.gson.stream.JsonReader;

import java.io.FileNotFoundException;
import java.io.FileReader;
import java.lang.reflect.Type;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

public class KBTagManager {
    private Map<String, Tag> tagMap;
    private List<Tag> tags;
    private static final Type LIST_STRING_TYPE =
            new TypeToken<List<Tag>>(){}.getType();

    public KBTagManager(String filename) throws FileNotFoundException {
        JsonReader reader = new JsonReader(new FileReader(filename));
        Gson gson = new Gson();
        tags = gson.fromJson(reader, LIST_STRING_TYPE);

        this.tagMap = new HashMap<>(tags.size());
        for (Tag tag : tags)
            this.tagMap.put(tag.getTagName(), tag);
    }

    public boolean hasTag(String tagName)
    {
        return this.tagMap.containsKey(tagName);
    }

    public List<Tag> getAllTags()
    {
        return this.tags;
    }
}
