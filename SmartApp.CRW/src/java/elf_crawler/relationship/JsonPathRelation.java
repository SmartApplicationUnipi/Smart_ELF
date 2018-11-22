package elf_crawler.relationship;

public class JsonPathRelation extends RelationQuery {

    private String jsonPath;

    public JsonPathRelation(String jsonPath) {
        super.type = RelationQueryType.JSON_PATH;
        this.jsonPath = jsonPath;
    }

    public String getJsonPath() {
        return jsonPath;
    }
}
