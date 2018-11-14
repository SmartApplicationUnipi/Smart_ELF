package elf_crawler.relationship;

public class Relation {

    private String predicate;
    private String subject;
    private String object;
    private RelationGroupBy groupby;

    public Relation(String predicate, String subject, String object) {
        this(predicate, subject, object, null);
    }

    public Relation(String predicate, String subject, String object, String groupby) {
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
