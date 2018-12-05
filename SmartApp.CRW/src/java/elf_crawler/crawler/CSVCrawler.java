package elf_crawler.crawler;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.opencsv.CSVParser;
import com.opencsv.CSVParserBuilder;
import com.opencsv.CSVReader;
import com.opencsv.CSVReaderBuilder;
import elf_crawler.relationship.*;
import elf_crawler.util.Logger;

import javax.xml.crypto.Data;
import java.io.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class CSVCrawler extends Crawler {

    private static final String POSSIBLE_SEPARATOR_CHARS = "[,;\t]";

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

        List<DataEntry> entries = buildEntries();

        return new CrawledData(this.file.getLink(), null, entries);
    }

    /* Creates a list with one entry for each row of the CSV File */
    private List<DataEntry> buildEntries() {
        List<DataEntry> entries = new ArrayList<>(this.csvRecords.size() - 1);
        List<RelationQuery> relations = this.rs.getWebsiteRelations(this.file.getLink().getUrl());

        String[] keys = this.csvRecords.get(0);
        Map<String, Integer> csvColumnIndex = new HashMap<>(keys.length);
        for (int i = 0; i < keys.length; i++)
            csvColumnIndex.put(keys[i], i);

        String[] iValues;
        JsonObject jo;

        //Add the JSONArray to entries (one entry for each object of json array)
        for (int j = 1; j < this.csvRecords.size(); j++) {
            iValues = this.csvRecords.get(j);

            // For each relation, build an entry
            for (RelationQuery r : relations) {
                if (!(r instanceof CSVRelation)) {
                    Logger.error(String.format("A wrong relationship exists for the document %s.", this.file.getLink().getUrl()));
                    continue;
                }

                jo = new JsonObject();
                CSVRelation rel = (CSVRelation) r;

                // For each column that the relation mentions, add it to the JSON
                if (rel.getColumns().size() == 0)
                    // All columns selected
                    for (String col : keys) {
                        int index = csvColumnIndex.get(col);
                        jo.addProperty(keys[index], iValues[index]);
                    }
                else
                    // Just some specific columns selected
                    for (String col : rel.getColumns()) {
                        int index = csvColumnIndex.get(col);
                        jo.addProperty(keys[index], iValues[index]);
                    }

                entries.add(new DataEntry(this.file.getLink().getUrl(), rel.getTag(), this.timestamp, DataEntryType.CSV, jo));
            }

            //Fill the json object with right values
            //jo = new JsonObject();
            /*for(int i=0; j<keys.length; j++){
                jo.addProperty(keys[i], iValues[i]);
            }*/

            //entries.add(new DataEntry(this.file.getLink().getUrl(), this.timestamp, DataEntryType.JSON, jo));
        }

        return entries;
    }


    /* Reads the records from the DownloadedFile */
    private void readRecords() throws IOException {
        String content = file.getContent();

        //Infers separator char at runtime
        char sepChar = findSeparatorChar(content);

        final CSVParser parser =
                new CSVParserBuilder()
                        .withSeparator(sepChar)
                        .withIgnoreLeadingWhiteSpace(true)
                        .build();
        final CSVReader reader =
                new CSVReaderBuilder(new StringReader(content))
                        .withCSVParser(parser)
                        .build();

        this.csvRecords = reader.readAll();
    }

    /* Creates dynamically a Json Array of object with fields of csv */
    /*private String createJsonArray(){

        String[] keys = this.csvRecords.get(0);
        String[] iValues;

        JsonObject jo;
        JsonArray jsonArray = new JsonArray();
        for(int i=1; i<this.csvRecords.size(); i++){
            iValues = csvRecords.get(i);

            //Fill the json object with right values
            jo = new JsonObject();
            for(int j=0; j<keys.length; j++){
                jo.addProperty(keys[j], iValues[j]);
            }

            jsonArray.add(jo);
        }

        return jsonArray.toString();
    }*/

    /* InferS the separator char at runtime */
    private char findSeparatorChar(String content) {
        Pattern pattern = Pattern.compile(POSSIBLE_SEPARATOR_CHARS);
        Matcher matcher = pattern.matcher(content);
        if (matcher.find())
            return content.charAt(matcher.start());
        else
            return ',';
    }
}
