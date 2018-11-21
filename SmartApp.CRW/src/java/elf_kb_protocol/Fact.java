package elf_kb_protocol;

public class Fact {
    private String idSource;
    private String infoSum;
    private KBTTL TTL;
    private int reliability;
    private boolean revisioning;
    private Object jsonFact;

    public Fact(String infoSum, KBTTL TTL, int reliability, boolean revisioning, Object jsonFact) {
        this.infoSum = infoSum;
        this.TTL = TTL;
        this.reliability = reliability;
        this.revisioning = revisioning;
        this.jsonFact = jsonFact;
    }

    public String getInfoSum() {
        return infoSum;
    }

    public KBTTL getTTL() {
        return TTL;
    }

    public int getReliability() {
        return reliability;
    }

    public boolean isRevisioning() {
        return revisioning;
    }

    public Object getJsonFact() {
        return jsonFact;
    }

    protected void setIdSource(String idSource)
    {
        this.idSource = idSource;
    }
}
