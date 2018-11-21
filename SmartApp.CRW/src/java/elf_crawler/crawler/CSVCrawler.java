package elf_crawler.crawler;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.opencsv.CSVParser;
import com.opencsv.CSVParserBuilder;
import com.opencsv.CSVReader;
import com.opencsv.CSVReaderBuilder;
import elf_crawler.relationship.RelationQuery;
import elf_crawler.relationship.RelationshipSet;

import java.io.*;
import java.util.ArrayList;
import java.util.List;
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

        //List<Relation> rdfData = buildRdfData();
        List<DataEntry> entries = buildEntries();

        return new CrawledData(this.file.getLink(), null, entries);
    }

    /* Creates a list with 1 entry to send at kb */
    private List<DataEntry> buildEntries() {
        List<DataEntry> entries = new ArrayList<>(1);

        //Create a JSON Array of object with fields(col1,...,coln)
        String jsonArray = createJsonArray();

        //Add the JSONArray to entries (just one entry)
        entries.add(new DataEntry(this.file.getLink().getUrl(), this.timestamp, DataEntryType.JSON, jsonArray));

        return entries;
    }

    /* Creates a list of DataEntry to send at kb (from a list of relations) */
    private List<DataEntry> buildEntriesFromRelations(List<RelationQuery> relations){
        List<DataEntry> entries = new ArrayList<>(relations.size());

        for (RelationQuery r : relations)
            entries.add(new DataEntry(this.file.getLink().getUrl(), this.timestamp, DataEntryType.RDF, r));

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
    private String createJsonArray(){

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
    }

    /* InferS the separator char at runtime */
    private char findSeparatorChar(String content){
        Pattern pattern = Pattern.compile(POSSIBLE_SEPARATOR_CHARS);
        Matcher matcher = pattern.matcher(content);
        if(matcher.find())
            return content.charAt(matcher.start());
        else
            return ',';
    }
}
