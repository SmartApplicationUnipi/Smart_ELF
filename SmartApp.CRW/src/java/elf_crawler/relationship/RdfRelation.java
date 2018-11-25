package elf_crawler.relationship;

public class RdfRelation extends RelationQuery {

    private String predicate;
    private String subject;
    private String object;
    private RelationGroupBy groupby;

    public RdfRelation(String predicate, String subject, String object) {
        this(predicate, subject, object, null);
    }

    public RdfRelation(String predicate, String subject, String object, String groupby) {
        super.type = RelationQueryType.RDF_TRIPLE;
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
