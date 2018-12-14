package elf_crawler.crawler;

public class Tag {
    private String tagName, desc, doc;

    public Tag(String tagName, String desc, String doc) {
        this.tagName = tagName;
        this.desc = desc;
        this.doc = doc;
    }

    public String getTagName() {
        return tagName;
    }

    public String getDesc() {
        return desc;
    }

    public String getDoc() {
        return doc;
    }

    @Override
    public String toString() {
        return String.format("(%s, %s, %s)", this.tagName, this.desc, this.doc);
    }
}
