package elf_kb_protocol;

import com.google.gson.JsonElement;
import com.google.gson.JsonObject;

import java.util.HashSet;
import java.util.Set;

public class TagList {

    private JsonObject tags;
    private Set<String> tagSet;

    public TagList() {
        this.tags = new JsonObject();
        this.tagSet = new HashSet<>();
    }

    public void addTag(String tagName, String desc, String doc)
    {
        if (this.tagSet.contains(tagName))
            return;

        JsonObject tag = new JsonObject();
        tag.addProperty("desc", desc);
        tag.addProperty("doc", doc);
        this.tags.add(tagName, tag);
        this.tagSet.add(tagName);
    }

    protected JsonElement getTags()
    {
        return this.tags;
    }

    public boolean containsTag(String tag) {
        return this.tagSet.contains(tag);
    }
}
