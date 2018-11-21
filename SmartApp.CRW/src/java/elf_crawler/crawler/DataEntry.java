package elf_crawler.crawler;


public class DataEntry {
    private String TAG;
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

    public void setTag(String tag)
    {
        this.TAG = tag;
    }

    @Override
    public String toString() {
        return "DataEntry{" +
                "source='" + source + '\'' +
                ", timestamp=" + timestamp +
                ", type=" + type +
                ", data=" + data.toString() +
                '}';
    }
}
