package elf_crawler.crawler;

import elf_crawler.relationship.RelationshipSet;

import java.util.List;

public abstract class Crawler {

    protected DownloadedFile file;
    protected RelationshipSet rs;
    protected long timestamp;

    public Crawler(DownloadedFile file, RelationshipSet rs)
    {
        this.file = file;
        this.rs = rs;
    }

    public abstract CrawledData crawl();
}
