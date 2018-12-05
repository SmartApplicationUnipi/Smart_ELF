package elf_crawler;

import elf_crawler.stringvar.StringVarProcessor;

import java.util.Objects;

public class CrawlerAddress {

    private String url;
    private String unprocessedUrl;
    private int depth;

    public CrawlerAddress(String url, int depth) {
        this.unprocessedUrl = url;
        this.url = StringVarProcessor.process(url);
        this.depth = depth;
    }

    public String getUnprocessedUrl()
    {
        return unprocessedUrl;
    }

    public String getUrl() {
        return url;
    }

    public int getDepth() {
        return depth;
    }

    @Override
    public String toString()
    {
        return String.format("%s (%d)", this.url, this.depth);
    }

    @Override
    public boolean equals(Object obj) {
        if (obj == null) return false;

        if (obj instanceof CrawlerAddress)
        {
            CrawlerAddress other = (CrawlerAddress)obj;

            if (this.url != null && other.getUrl() != null)
                return this.url.equals(other.getUrl());
        }

        return false;
    }

    @Override
    public int hashCode() {
        return Objects.hash(url);
    }
}
