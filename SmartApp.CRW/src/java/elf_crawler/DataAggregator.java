package elf_crawler;

import elf_crawler.crawler.DataEntry;
import elf_crawler.util.ParallelList;

import java.util.*;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;

public class DataAggregator {

    private static final int EXPECTED_ENTRIES = 1024;
    private ParallelList<DataEntry> data;

    public DataAggregator()
    {
        this.data = new ParallelList<>(EXPECTED_ENTRIES);
    }

    public void addData(List<DataEntry> l)
    {
        this.data.addAll(l);
    }

    public List<DataEntry> aggregate()
    {
        return this.data;
    }

}