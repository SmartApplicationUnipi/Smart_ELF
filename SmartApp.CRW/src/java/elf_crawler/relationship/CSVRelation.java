package elf_crawler.relationship;

import java.util.List;

public class CSVRelation extends RelationQuery{

    private List<String> columns;

    public CSVRelation(String tag, List<String> columns) {
        super.type = RelationQueryType.CVS_COLS;
        super.tag = tag;
        this.columns = columns;
    }

    public List<String> getColumns() {
        return columns;
    }
}
