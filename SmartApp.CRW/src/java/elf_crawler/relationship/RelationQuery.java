package elf_crawler.relationship;

import elf_crawler.crawler.Tag;

public abstract class RelationQuery {

    protected RelationQueryType type;
    protected String tag;

    public RelationQueryType getType()
    {
        return this.type;
    }

    public String getTag() {
        return tag;
    }
}
