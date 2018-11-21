package elf_crawler.crawler;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import elf_crawler.relationship.RelationshipSet;

public class JSONCrawler extends Crawler {

    private JsonObject jsonRoot;

    public JSONCrawler(DownloadedFile df, RelationshipSet rs) {
        super(df, rs);

        
    }

    @Override
    public CrawledData crawl() {

        return null;
    }

    private void getJsonRoot(String json)
    {
        JsonParser parser = new JsonParser();
        this.jsonRoot = parser.parse(json).getAsJsonObject();
    }
}
