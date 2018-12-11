package elf_crawler.relationship;

import elf_crawler.crawler.Tag;

public class RdfRelation extends RelationQuery {

    private String predicate;
    private String subject;
    private String object;
    private RelationGroupBy groupby;


    public RdfRelation(String tag, String predicate, String subject, String object, String groupby) {
        super.type = RelationQueryType.RDF_TRIPLE;
        super.tag = tag;
        this.predicate = predicate;
        this.subject = subject;
        this.object = object;

        if (groupby != null)
            this.groupby = RelationGroupBy.getEnum(groupby);
    }

    public String getPredicate() {
        return predicate;
    }

    public String getSubject() {
        return subject;
    }

    public String getObject() {
        return object;
    }

    public RelationGroupBy getGroupBy() {
        return groupby;
    }

    @Override
    public String toString() {
        return String.format("(p: %s, s: %s, o: %s)", this.predicate, this.subject, this.object);
    }
}
