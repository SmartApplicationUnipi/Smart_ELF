package elf_crawler.crawler;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.opencsv.CSVReader;
import elf_crawler.relationship.RelationshipSet;

import java.io.*;
import java.util.ArrayList;
import java.util.List;

public class CSVCrawler extends Crawler {

    private List<String[]> csvRecords;

    public CSVCrawler(DownloadedFile file, RelationshipSet rs) {
        super(file, rs);
    }

    @Override
    public CrawledData crawl() {
        this.timestamp = System.currentTimeMillis();
        try {
            readRecords();
        } catch (IOException e) {
            System.err.println("Error in reading csv doc!");
            return null;
        }

        //List<Relation> rdfData = buildRdfData();
        List<DataEntry> entries = buildEntries();

        return new CrawledData(this.file.getLink(), null, entries);
    }

    /* Create a list with 1 entry to send at kb */
    private List<DataEntry> buildEntries() {
        List<DataEntry> entries = new ArrayList<>(1);

        //Create a JSON Array of object with fields(col1,...,coln)
        String jsonArray = createJsonArray();

        //Add the JSONArray to entries (just one entry)
        entries.add(new DataEntry(this.file.getLink().getUrl(), this.timestamp, DataEntryType.JSON, jsonArray));

        return entries;
    }

    /* Reads the records from the DownloadedFile */
    private void readRecords() throws IOException {
        String content = file.getContent();

        // convert String into BufferedInputStream
        InputStream is = new ByteArrayInputStream(content.getBytes());
        BufferedReader br = new BufferedReader(new InputStreamReader(is));


        CSVReader csvReader = new CSVReader(br);
        this.csvRecords = csvReader.readAll();
    }

    /* Creates dynamically a Json Array of object with fields of csv */
    private String createJsonArray(){

        String[] keys = this.csvRecords.get(0);
        String[] iValues;

        JsonObject jo;
        JsonArray jsonArray = new JsonArray();
        for(int i=1; i<this.csvRecords.size(); i++){
            iValues = csvRecords.get(i);

            //Fill the json object with right values
            jo = new JsonObject();
            for(int j=0; j<iValues.length; j++){
                jo.addProperty(keys[j], iValues[j]);
            }

            jsonArray.add(jo);
        }

        return jsonArray.toString();
    }
}
