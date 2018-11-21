package elf_crawler.crawler;

import elf_crawler.Link;
import elf_crawler.util.MimeType;

public class DownloadedFile {

    private Link link;
    private String content;
    private MimeType contentType;

    public DownloadedFile(Link link, String content, String contentType) {
        this.link = link;
        this.content = content;
        this.contentType = MimeType.getEnum(contentType);
    }

    public Link getLink() {
        return link;
    }

    public String getContent() {
        return content;
    }

    public MimeType getContentType() {
        return contentType;
    }
}
