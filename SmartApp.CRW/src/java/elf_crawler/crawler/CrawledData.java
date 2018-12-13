package elf_crawler.crawler;

import elf_crawler.CrawlerAddress;

import java.util.Collections;
import java.util.List;

public class CrawledData {

    private CrawlerAddress crawlerAddress;
    private List<CrawlerAddress> discoveredAddresses;
    private List<DataEntry> dataEntries;


    public CrawledData(CrawlerAddress crawlerAddress, List<DataEntry> dataEntries)
    {
        this(crawlerAddress, Collections.emptyList(), dataEntries);
    }

    public CrawledData(CrawlerAddress crawlerAddress, List<CrawlerAddress> foundCrawlerAddresses, List<DataEntry> dataEntries)
    {
        this.crawlerAddress = crawlerAddress;
        this.discoveredAddresses = foundCrawlerAddresses;
        this.dataEntries = dataEntries;
    }

    public static CrawledData empty()
    {
        return new CrawledData(null, null, null);
    }

    public List<CrawlerAddress> getDiscoveredAddresses() {
        return discoveredAddresses;
    }

    public List<DataEntry> getDataEntries() {
        return this.dataEntries;
    }

    public boolean hasRdfData() {
        return this.dataEntries.size() > 0;
    }

    public boolean isEmpty()
    {
        return this.discoveredAddresses == null && this.dataEntries == null;
    }

    public int getDepth() { return this.crawlerAddress.getDepth(); }

    public CrawlerAddress getCrawlerAddress() { return this.crawlerAddress;}
}
