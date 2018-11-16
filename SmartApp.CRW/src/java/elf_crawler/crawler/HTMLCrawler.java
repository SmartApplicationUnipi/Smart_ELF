package elf_crawler.crawler;

import elf_crawler.CrawlingManager;
import elf_crawler.Link;
import elf_crawler.relationship.Relation;
import elf_crawler.relationship.RelationshipSet;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.*;

public class HTMLCrawler extends Crawler {

    private static final int MAX_GROUP_BY_PARENT_DEPTH = 4;
    private Document doc;

    public HTMLCrawler(DownloadedFile file, RelationshipSet rs)
    {
        super(file, rs);
        this.file = file;
        this.rs = rs;
    }

    @Override
    public CrawledData crawl() {
        this.timestamp = System.currentTimeMillis();
        this.doc = Jsoup.parse(this.file.getContent());

        List<Relation> rdfData = buildRdfData();
        List<DataEntry> entries = buildEntries(rdfData);

        return new CrawledData(this.file.getLink(), getAllLinks(doc), entries);
    }

    private String removeHashtag(String url)
    {
        int hashtagPos = url.indexOf("#");
        if (hashtagPos != -1)
            url = url.substring(0, hashtagPos);

        return url;
    }

    private boolean isURLValid(String url)
    {
        try {
            URL urlObj = new URL(url);

            for (String p : CrawlingManager.ACCEPTED_PROTOCOLS)
                if (urlObj.getProtocol().equals(p))
                    return true;

        } catch (MalformedURLException e) {
        }

        return false;
    }

    private List<Link> getAllLinks(Document doc)
    {
        int parentDepth = this.file.getLink().getDepth();
        Elements hrefs = doc.select("a[href]");

        List<Link> links = new LinkedList<>();
        for (Element e : hrefs) {
            String url = e.attr("abs:href");
            url = removeHashtag(url);

            if (isURLValid(url))
                links.add(new Link(url, parentDepth + 1));
        }

        return links;
    }

    /* Retrieve elements in a doc which contains a certain text */
    private Elements getElementsContainingText(Document doc, String text){
        return doc.select("*:containsOwn("+text+")");
    }

    /* Retrieve all the tables within a Document */
    private Elements getAllTables(Document doc){
        return doc.select("table");
    }

    /* Retrieve all the elements in a column of a table*/
    private Elements getColElementsFromTable(Element table, int index){
        return table.select("td:eq("+index+")");
    }

    private String[] elementsToStringArr(Elements e)
    {
        String[] arr = new String[e.size()];
        int i = 0;
        for (Element el : e)
            arr[i++] = el.html();

        return arr;
    }

    private List<Relation> buildRdfData()
    {
        List<Relation> rdfData = this.rs.getWebsiteRelations(this.file.getLink().getUrl());
        List<Relation> builtRelations = new ArrayList<>(rdfData.size());

        for (Relation r : rdfData) {
            switch (r.getGroupBy()) {
                case GROUP_BY_DOM_PARENT:
                    builtRelations.addAll(groupByDomParent(this.doc, r));
                    break;
                case GROUP_BY_TRY_ALL:
                    break;
                default:
                    break;
            }
        }

        return builtRelations;
    }

    private List<DataEntry> buildEntries(List<Relation> relations) {
        List<DataEntry> entries = new ArrayList<>(relations.size());

        for (Relation r : relations)
            entries.add(new DataEntry(this.file.getLink().getUrl(), this.timestamp, DataEntryType.RDF, r));

        return entries;
    }

    private List<Relation> groupByDomParent(Document doc, Relation r) {
        Elements subjects = doc.select(r.getSubject());
        String predicate = r.getPredicate();

        if (subjects.size() == 0)
            return Collections.emptyList();

        List<Relation> relations = new ArrayList<>(subjects.size());
        for (Element subject : subjects)
        {
            Element parent = subject.parent();
            Elements objects = null;
            for (int p = 0; p < MAX_GROUP_BY_PARENT_DEPTH; p++) {
                if (parent == null) break;

                objects = parent.select(r.getObject());

                if (objects.size() > 0)
                    break;
                else
                    parent = parent.parent();
            }
            if (parent == null) continue;

            for (Element object : objects)
                relations.add(new Relation(predicate, subject.text(), object.text()));
        }

        return relations;
    }
}
