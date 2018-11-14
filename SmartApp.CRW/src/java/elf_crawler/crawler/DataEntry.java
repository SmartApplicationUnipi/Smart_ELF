package elf_crawler.crawler;


public class DataEntry {
    public String source;
    public long timestamp;
    public DataEntryType type;
    public Object data;

    public DataEntry(String source, long timestamp, DataEntryType type, Object data) {
        this.source = source;
        this.timestamp = timestamp;
        this.type = type;
        this.data = data;
    }

    @Override
    public String toString() {
        return "DataEntry{" +
                "source='" + source + '\'' +
                ", timestamp=" + timestamp +
                ", type=" + type +
                ", data=" + data +
                '}';
    }
}
