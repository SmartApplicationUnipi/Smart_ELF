package elf_crawler;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

public class ConcurrentHashSet<T> implements Set<T> {
    private ConcurrentHashMap<T, Boolean> map;

    public ConcurrentHashSet()
    {
        this.map = new ConcurrentHashMap<>();
    }

    public ConcurrentHashSet(int initialCapacity, float loadFactor, int concurrencyLevel)
    {
        this.map = new ConcurrentHashMap<>(initialCapacity, loadFactor, concurrencyLevel);
    }

    @Override
    public int size() {
        return this.map.size();
    }

    @Override
    public boolean isEmpty() {
        return this.map.isEmpty();
    }

    @Override
    public boolean contains(Object o) {
        return this.map.contains(o);
    }

    @Override
    public Iterator<T> iterator() {
        return null;
    }

    @Override
    public Object[] toArray() {
        return this.map.keySet().toArray();
    }

    @Override
    public <T1> T1[] toArray(T1[] a) {
        return this.map.keySet().toArray(a);
    }

    @Override
    public boolean add(T t) {
        boolean result = this.map.contains(t);

        if (!result)
            this.map.put(t, Boolean.TRUE);

        return result;
    }

    @Override
    public boolean remove(Object o) {
        boolean result = this.map.contains(o);

        if (!result)
            this.map.remove(o);

        return result;
    }

    @Override
    public boolean containsAll(Collection<?> c) {
        for (Object o : c)
            if (!this.map.contains(o))
                return false;

        return true;
    }

    @Override
    public boolean addAll(Collection<? extends T> c) {
        return false;
    }

    @Override
    public boolean retainAll(Collection<?> c) {
        return false;
    }

    @Override
    public boolean removeAll(Collection<?> c) {
        return false;
    }

    @Override
    public void clear() {
        this.map.clear();
    }
}
