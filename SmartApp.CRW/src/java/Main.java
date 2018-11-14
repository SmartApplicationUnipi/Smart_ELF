import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.google.gson.stream.JsonReader;
import elf_crawler.CrawlingManager;
import elf_crawler.crawler.DataEntry;
import elf_crawler.relationship.Relation;
import elf_crawler.relationship.RelationshipSet;
import elf_kb_protocol.Fact;
import elf_kb_protocol.KBConnection;
import elf_kb_protocol.KBTTL;

import java.io.*;
import java.lang.reflect.Type;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.*;

public class Main {

    private static Gson gson = new Gson();

    public static void main(String[] args) throws Exception {
        int processors = Runtime.getRuntime().availableProcessors();
        System.err.println("Using " + processors + " threads");

        Set<String> urlSet = readURLSet("url-set.json");
        RelationshipSet rs = new RelationshipSet("relationship-set.json");
        CrawlingManager cs = new CrawlingManager(urlSet, rs);

        List<DataEntry> dataEntries = cs.executeAllCrawlers();
        cs.shutdownScheduler();

        System.err.println("HTMLCrawler finished!");
        if (cs.hasNewLinks()) {
            System.err.println(String.format("Discovered %d new links!", cs.getNewLinkCount()));
            //saveURLSet("url-set.json", cs.getAllUrls());
        }

        KBConnection con = new KBConnection("ws://131.114.3.213", 5666);
        con.register();
        for (DataEntry d: dataEntries) {

            // TODO check why d is null
            if (d == null) continue;

            d.setTag(CrawlingManager.CRAWLER_DATA_ENTRY_TAG);
            con.addFact(new Fact(CrawlingManager.CRAWLER_DATA_ENTRY_TAG, KBTTL.DAY, 70, true, d));
        }

        con.closeConnection();
    }

    private static final Type URL_SET_TYPE =
            new TypeToken<Set<String>>(){}.getType();
    public static Set<String>  readURLSet(String filename) throws FileNotFoundException {
        JsonReader reader = new JsonReader(new FileReader(filename));

        return gson.fromJson(reader, URL_SET_TYPE);
    }

    public static String rdfDataToJson(Map<String, List<Relation>> rdfData) {
        return gson.toJson(rdfData);
    }

    public static void saveURLSet(String filename, List<String> urls) throws IOException {
        FileWriter writer = new FileWriter(filename);
        writer.write(gson.toJson(urls));
        writer.close();
    }

}
