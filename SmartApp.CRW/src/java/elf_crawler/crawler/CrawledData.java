package elf_crawler.crawler;

import elf_crawler.Link;

import java.util.List;

public class CrawledData {

    private Link link;
    private List<Link> externalLinks;
    private List<DataEntry> dataEntries;

    public CrawledData(Link link, List<Link> externalLinks, List<DataEntry> dataEntries)
    {
        this.link = link;
        this.externalLinks = externalLinks;
        this.dataEntries = dataEntries;
    }

    public static CrawledData empty()
    {
        return new CrawledData(null, null, null);
    }

    public List<Link> getExternalLinks() {
        return externalLinks;
    }

    public List<DataEntry> getDataEntries() {
        return this.dataEntries;
    }

    public boolean hasRdfData() {
        return this.dataEntries.size() > 0;
    }

    public boolean isEmpty()
    {
        return this.externalLinks == null && this.dataEntries == null;
    }

    public int getDepth() { return this.link.getDepth(); }

    public Link getLink() { return this.link;}
}
