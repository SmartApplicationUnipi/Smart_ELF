package elf_crawler.crawler;

import com.google.gson.annotations.SerializedName;

public enum DataEntryType {

    @SerializedName("rdf")
    RDF("rdf"),

    @SerializedName("json")
    JSON("json");

    private final String text;
    DataEntryType(final String text){
        this.text = text;
    };

    public String getText()
    {
        return this.text;
    }
}
