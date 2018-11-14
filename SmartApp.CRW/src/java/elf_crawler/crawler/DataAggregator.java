package elf_crawler.crawler;

import java.util.*;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.locks.ReentrantReadWriteLock;

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
class ParallelList<T> implements List<T>
{
    private static final int DEFAULT_SIZE = 10;
    private static final int GROWTH = 2;
    private Object[] elements;
    private AtomicInteger ctr;
    private AtomicBoolean growing;

    public ParallelList()
    {
        this(DEFAULT_SIZE);
    }

    public ParallelList(int initialCapacity)
    {
        this.elements = new Object[initialCapacity];
        this.ctr = new AtomicInteger(0);
        this.growing = new AtomicBoolean(false);
    }

    @Override
    public int size() {
        return this.ctr.get();
    }

    @Override
    public boolean isEmpty() {
        return this.elements.length == 0;
    }

    @Override
    public boolean contains(Object o) {
        int curCtr = this.ctr.get();
        for (int i = 0; i < curCtr; i++)
        {
            Object curObj = this.elements[i];
            if (curObj != null && curObj.equals(o))
                return true;
        }

        return false;
    }

    @Override
    @SuppressWarnings("unchecked")
    public Iterator<T> iterator() {
        int curCtr = this.ctr.get();
        List<T> l = new ArrayList<>(curCtr);

        for (int i = 0; i < curCtr; i++)
        {
            T curObj = (T) this.elements[i];
            l.add(curObj);
        }

        return l.iterator();
    }

    @Override
    public Object[] toArray() {
        return Arrays.copyOf(this.elements, this.size());
    }

    @Override
    @SuppressWarnings("unchecked")
    public <T1> T1[] toArray(T1[] a) {
        return (T1[]) Arrays.copyOf(this.elements, this.size(), a.getClass());
    }

    @Override
    public boolean add(T t) {
        checkForOverflow();
        int pos = this.ctr.incrementAndGet();
        this.elements[pos] = t;

        return true;
    }

    private void checkForOverflow()
    {
        if (this.ctr.get() >= this.elements.length) // T1, T2
            if (this.growing.compareAndSet(false, true)) // T2, T1
                 // This additional check is necessary to avoid the ABA problem
                 if (this.ctr.get() >= this.elements.length) { // T2,
                    this.grow();
                    this.growing.set(false);
                }


        while (this.growing.get()) {
            try {
                Thread.sleep(10);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }

    private void grow() {
        Object[] newArr = new Object[this.elements.length * GROWTH];
        System.arraycopy(this.elements, 0, newArr, 0, this.elements.length);
        this.elements = newArr;
    }

    @Override
    public boolean remove(Object o) {
        return false;
    }

    @Override
    public boolean containsAll(Collection<?> c) {
        return false;
    }

    @Override
    public boolean addAll(Collection<? extends T> c) {
        for (T t : c)
            this.add(t);

        return true;
    }

    @Override
    public boolean addAll(int index, Collection<? extends T> c) {
        return false;
    }

    @Override
    public boolean removeAll(Collection<?> c) {
        return false;
    }

    @Override
    public boolean retainAll(Collection<?> c) {
        return false;
    }

    @Override
    public void clear() {
        this.ctr.set(0);
    }

    @Override
    @SuppressWarnings("unchecked")
    public T get(int index) {
        return (T) this.elements[index];
    }

    @Override
    @SuppressWarnings("unchecked")
    public T set(int index, T element) {
        checkBounds(index);
        T old = (T) this.elements[index];
        this.elements[index] = element;

        return old;
    }

    @Override
    public void add(int index, T element) {

    }

    @Override
    public T remove(int index) {
        return null;
    }

    @Override
    public int indexOf(Object o) {
        return 0;
    }

    @Override
    public int lastIndexOf(Object o) {
        return 0;
    }

    @Override
    public ListIterator<T> listIterator() {
        return null;
    }

    @Override
    public ListIterator<T> listIterator(int index) {
        return null;
    }

    @Override
    public List<T> subList(int fromIndex, int toIndex) {
        return null;
    }

    private void checkBounds(int index)
    {
        if (index >= this.ctr.get())
            throw new IndexOutOfBoundsException();
    }
}