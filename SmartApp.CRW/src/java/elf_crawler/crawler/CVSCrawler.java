package elf_crawler.crawler;

import elf_crawler.relationship.RelationshipSet;

public class CVSCrawler extends Crawler {

    public CVSCrawler(DownloadedFile file, RelationshipSet rs) {
        super(file, rs);
    }

    @Override
    public CrawledData crawl() {
        return null;
    }
}
