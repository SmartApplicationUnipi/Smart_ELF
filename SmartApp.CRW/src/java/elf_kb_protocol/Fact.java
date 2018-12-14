package elf_kb_protocol;

public class Fact {
    private String tag;
    private KBTTL TTL;
    private int reliability;
    private Object jsonFact;

    public Fact(String tag, KBTTL TTL, int reliability, Object jsonFact) {
        this.tag = tag;
        this.TTL = TTL;
        this.reliability = reliability;
        this.jsonFact = jsonFact;
    }

    public String getTag() {
        return tag;
    }

    public KBTTL getTTL() {
        return TTL;
    }

    public int getReliability() {
        return reliability;
    }

    public Object getJsonFact() {
        return jsonFact;
    }
}
