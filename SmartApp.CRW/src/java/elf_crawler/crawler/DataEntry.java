package elf_crawler.crawler;


public class DataEntry {
    public String source;
    public String tag;
    public long timestamp;
    public DataEntryType type;
    public Object data;

    public DataEntry(String source, String tag, long timestamp, DataEntryType type, Object data) {
        this.source = source;
        this.tag = tag;
        this.timestamp = timestamp;
        this.type = type;
        this.data = data;
    }


    @Override
    public String toString() {
        return "DataEntry{" +
                "source='" + source + '\'' +
                ", tag=" + tag +
                ", timestamp=" + timestamp +
                ", type=" + type +
                ", data=" + data.toString() +
                '}';
    }
}
