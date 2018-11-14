package elf_kb_protocol;

public class Fact {
    private String sessionID;
    private String infoSum;
    private KBTTL TTL;
    private int reliability;
    private boolean revisioning;
    private String jsonFact;

    public Fact(String infoSum, KBTTL TTL, int reliability, boolean revisioning, String jsonFact) {
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

    public String getJsonFact() {
        return jsonFact;
    }

    protected void setSessionID(String sessionID)
    {
        this.sessionID = sessionID;
    }
}
