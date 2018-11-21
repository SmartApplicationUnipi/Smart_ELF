package elf_crawler.relationship;

public abstract class RelationQuery {

    protected RelationQueryType type;

    public RelationQueryType getType()
    {
        return this.type;
    }
}
