package elf_crawler.crawler;


import com.google.gson.Gson;
import com.jayway.jsonpath.JsonPath;
import elf_crawler.relationship.JsonPathRelation;
import elf_crawler.relationship.RelationQuery;
import elf_crawler.relationship.RelationshipSet;
import elf_crawler.util.Logger;
import net.minidev.json.JSONArray;
import net.minidev.json.JSONObject;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class JSONCrawler extends Crawler {

    //private static final JsonProvider JSON_PATH_PROVIDER = Configuration.defaultConfiguration().jsonProvider();
    private Object jsonDocument;

    public JSONCrawler(DownloadedFile df, RelationshipSet rs) {
        super(df, rs);

        this.jsonDocument = (new Gson()).fromJson(super.file.getContent(), Object.class);
    }

    @Override
    public CrawledData crawl() {
        super.timestamp = System.currentTimeMillis();
        List<RelationQuery> relations = rs.getWebsiteRelations(super.file.getCrawlerAddress());
        List<DataEntry> entries = buildEntries(relations);

        return new CrawledData(super.file.getCrawlerAddress(), entries);
    }

    private List<DataEntry> buildEntries(List<RelationQuery> relations) {

        List<DataEntry> entries = new ArrayList<>(relations.size());
        for (RelationQuery r : relations)
        {
            if (!(r instanceof JsonPathRelation)) {
                Logger.error(String.format("A wrong relationship exists for the document %s.", this.file.getCrawlerAddress().getUrl()));
                continue;
            }

            String query = ((JsonPathRelation)r).getJsonPath();
            Object resultJson = JsonPath.read(this.jsonDocument, query);

            if (resultJson instanceof JSONArray)
            {
                JSONArray arr = (JSONArray)resultJson;
                for (Object e : arr)
                    entries.add(new DataEntry(super.file.getCrawlerAddress().getUrl(), r.getTag(), super.timestamp, DataEntryType.JSON, e));
            }

            if (resultJson instanceof JSONObject || resultJson instanceof Map)
                entries.add(new DataEntry(super.file.getCrawlerAddress().getUrl(), r.getTag(), super.timestamp, DataEntryType.JSON, resultJson));
        }

        return entries;
    }
}
