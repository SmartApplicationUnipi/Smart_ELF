package elf_crawler.crawler;

public class DownloadedFile {

    private Link link;
    private String content;

    public DownloadedFile(Link link, String content) {
        this.link = link;
        this.content = content;
    }

    public Link getLink() {
        return link;
    }

    public String getContent() {
        return content;
    }
}
