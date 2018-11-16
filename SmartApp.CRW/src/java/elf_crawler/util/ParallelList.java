package elf_crawler.util;

import java.util.*;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;

public class ParallelList<T> implements List<T>
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
        return this.ctr.get() == 0;
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
        return new ParallelListIterator<>(this);
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
        int pos = this.ctr.incrementAndGet() - 1;
        checkForOverflow();
        this.elements[pos] = t;
        return true;
    }

    private void checkForOverflow()
    {
        while (this.ctr.get() >= this.elements.length)
        {
            if (this.growing.compareAndSet(false, true)) { // T2, T1
                // This additional check is necessary to avoid the ABA problem
                if (this.ctr.get() >= this.elements.length) // T2,
                    this.grow();

                this.growing.set(false);
            }

            try {
                Thread.sleep(1);
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


    class ParallelListIterator<T> implements Iterator<T>
    {
        private ParallelList<T> l;
        private int localCtr;
        private int cur;
        private Object curElement;

        public ParallelListIterator(ParallelList<T> l)
        {
            this.l = l;
            this.localCtr = this.l.ctr.get();
            this.cur = 0;
            this.curElement = null;
            advanceTillNextNonNull();
        }

        @Override
        public boolean hasNext() {
            return this.curElement != null;
        }

        @Override
        @SuppressWarnings("unchecked")
        public T next() {
            Object toReturn = curElement;
            advanceTillNextNonNull();
            return (T) toReturn;
        }

        private void advanceTillNextNonNull()
        {
            this.curElement = null;
            while (this.cur < this.localCtr && this.curElement == null) {
                this.curElement = this.l.elements[this.cur++];
            }
        }
    }
}
