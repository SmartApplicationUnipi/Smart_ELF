package elf_crawler;

import java.util.Objects;

public class Link {

    private String url;
    private int depth;

    public Link(String url, int depth) {
        this.url = url;
        this.depth = depth;
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

        if (obj instanceof Link)
        {
            Link other = (Link)obj;

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
