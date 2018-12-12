package elf_crawler.crawler;

import elf_crawler.CrawlerAddress;
import elf_crawler.CrawlingManager;
import elf_crawler.relationship.*;
import elf_crawler.util.Logger;
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
        super.timestamp = System.currentTimeMillis();
        this.doc = Jsoup.parse(this.file.getContent());

        List<DataEntry> entries = buildEntries();

        return new CrawledData(this.file.getCrawlerAddress(), getAllLinks(doc), entries);
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

    private List<CrawlerAddress> getAllLinks(Document doc)
    {
        int parentDepth = this.file.getCrawlerAddress().getDepth();
        Elements hrefs = doc.select("a[href]");

        List<CrawlerAddress> crawlerAddresses = new LinkedList<>();
        for (Element e : hrefs) {
            String url = e.attr("abs:href");
            url = removeHashtag(url);

            if (isURLValid(url))
                crawlerAddresses.add(new CrawlerAddress(url, parentDepth + 1));
        }

        return crawlerAddresses;
    }

    private List<DataEntry> buildEntries()
    {
        List<RelationQuery> relations = this.rs.getWebsiteRelations(this.file.getCrawlerAddress());
        List<DataEntry> entries = new ArrayList<>(relations.size());

        for (RelationQuery r : relations) {
            if (!(r instanceof RdfRelation)) {
                Logger.error(String.format("A wrong relationship exists for the document %s.", this.file.getCrawlerAddress().getUrl()));
                continue;
            }

            RdfRelation rdf = (RdfRelation) r;
            switch (rdf.getGroupBy()) {
                case GROUP_BY_DOM_PARENT:
                    entries.addAll(groupByDomParent(this.doc, rdf));
                    break;
                case GROUP_BY_TRY_ALL:
                    break;
                default:
                    break;
            }
        }

        return entries;
    }

    private List<DataEntry> groupByDomParent(Document doc, RdfRelation r) {
        Elements subjects = doc.select(r.getSubject());
        String predicate = r.getPredicate();

        if (subjects.size() == 0)
            return Collections.emptyList();

        List<DataEntry> entries = new ArrayList<>(subjects.size());
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

            for (Element object : objects) {
                RdfRelation builtRdf = new RdfRelation(r.getTag(), predicate, subject.text(), object.text(), r.getGroupBy().getText());
                entries.add(new DataEntry(this.file.getCrawlerAddress().getUrl(), builtRdf.getTag(), super.timestamp, DataEntryType.RDF, builtRdf));
            }
        }

        return entries;
    }
}
