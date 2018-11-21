import com.google.gson.Gson;
import elf_crawler.CrawlingManager;
import elf_crawler.URLSet;
import elf_crawler.crawler.DataEntry;
import elf_crawler.relationship.RdfRelation;
import elf_crawler.relationship.RelationshipSet;
import elf_kb_protocol.Fact;
import elf_kb_protocol.KBConnection;
import elf_kb_protocol.KBTTL;
import org.slf4j.Logger;

import java.io.*;
import java.util.List;
import java.util.Map;
import java.util.logging.LogManager;

public class Main {

    private static Gson gson = new Gson();

    public static void main(String[] args) throws Exception {
        int processors = Runtime.getRuntime().availableProcessors();
        System.err.println(String.format("Using %d threads", processors));

        URLSet urlSet = new URLSet("url-set.json");
        RelationshipSet rs = new RelationshipSet("relationship-set.json");
        CrawlingManager cs = new CrawlingManager(urlSet, rs);

        List<DataEntry> dataEntries = cs.executeAllCrawlers();
        cs.shutdown();

        System.err.println("All Crawlers have finished!");
        if (cs.hasNewLinks()) {
            System.err.println(String.format("Discovered %d new links!", cs.getNewLinkCount()));
        }

        KBConnection con = new KBConnection("ws://131.114.3.213", 5666);
        con.register();
        for (DataEntry d: dataEntries) {
            if (d == null) continue;

            d.setTag(CrawlingManager.CRAWLER_DATA_ENTRY_TAG);
            System.out.println(d);
            con.addFact(new Fact(CrawlingManager.CRAWLER_DATA_ENTRY_TAG, KBTTL.DAY, 70, true, d));
        }

        con.closeConnection();
    }

    public static String rdfDataToJson(Map<String, List<RdfRelation>> rdfData) {
        return gson.toJson(rdfData);
    }

    public static void saveURLSet(String filename, List<String> urls) throws IOException {
        FileWriter writer = new FileWriter(filename);
        writer.write(gson.toJson(urls));
        writer.close();
    }

}
