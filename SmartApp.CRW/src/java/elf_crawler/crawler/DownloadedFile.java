package elf_crawler.crawler;

import elf_crawler.CrawlerAddress;
import elf_crawler.util.MimeType;

public class DownloadedFile {

    private CrawlerAddress crawlerAddress;
    private String content;
    private MimeType contentType;

    public DownloadedFile(CrawlerAddress crawlerAddress, String content, String contentType) {
        this.crawlerAddress = crawlerAddress;
        this.content = content;
        this.contentType = MimeType.getEnum(contentType);
    }

    public CrawlerAddress getCrawlerAddress() {
        return crawlerAddress;
    }

    public String getContent() {
        return content;
    }

    public MimeType getContentType() {
        return contentType;
    }
}
