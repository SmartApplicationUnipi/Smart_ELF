package elf_kb_protocol;

import java.util.List;

public class Tags {

    private Tag crawler_tag;
    private static final String desc_tag1 = "ProvaDesc1";
    private static final String doc_tag1 = "ProvaDoc1";

    public Tags() {

        crawler_tag = new Tag(desc_tag1, doc_tag1);

    }

    public class Tag{
        private String desc;
        private String doc;

        public Tag(String desc, String doc) {
            this.desc = desc;
            this.doc = doc;
        }
    }
}
