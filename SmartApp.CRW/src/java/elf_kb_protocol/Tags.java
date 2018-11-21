package elf_kb_protocol;


public class Tags {

    private Tag rdf_tag;

    public Tags() {

        rdf_tag = new Tag("RdfDesc", "RdfDoc");

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
