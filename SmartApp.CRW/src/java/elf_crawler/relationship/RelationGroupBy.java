package elf_crawler.relationship;

import com.google.gson.annotations.SerializedName;

public enum RelationGroupBy {
    @SerializedName("parent")
    GROUP_BY_DOM_PARENT("parent"),

    @SerializedName("try-all")
    GROUP_BY_TRY_ALL("try-all");

    private final String text;
    RelationGroupBy(final String text){
        this.text = text;
    };

    public String getText()
    {
        return this.text;
    }

    public static RelationGroupBy getEnum(String value) {

        for(RelationGroupBy v : values())
            if(v.getText().equalsIgnoreCase(value)) return v;
        throw new IllegalArgumentException();
    }
}
