package elf_crawler.util;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class ParallelListTest {


    private static final int TEST_SIZE = 100000;
    ParallelList<Integer> p;


    @BeforeEach
    void setUp() {
        this.p = new ParallelList<>();
        assertEquals(0, p.size(), "Initial list reports existing elements!");
    }

    @org.junit.jupiter.api.Test
    void size() throws InterruptedException {
        for (int i = 0; i < TEST_SIZE; i++)
            p.add(i);

        assertEquals(TEST_SIZE, p.size(), "Failed size() test on single thread!");
        p = new ParallelList<>();

        Thread t1, t2;
        t1 = new Thread(() -> {
            for (int i = 0; i < TEST_SIZE / 2 ; i++)
                p.add(i);
        });
        t2 = new Thread(() -> {
            for (int i = TEST_SIZE/2; i < TEST_SIZE; i++)
                p.add(i);
        });
        t1.start();
        t2.start();
        t1.join();
        t2.join();

        assertEquals(TEST_SIZE, p.size(), "Failed size() test on 2 threads!");
    }

    @org.junit.jupiter.api.Test
    void isEmpty() throws InterruptedException {
        assertTrue(p.isEmpty());

        Thread t1, t2;
        t1 = new Thread(() -> {
            for (int i = 0; i < TEST_SIZE / 2 ; i++)
                p.add(i);

            Assertions.assertTrue(!p.isEmpty());
        });
        t2 = new Thread(() -> {
            for (int i = TEST_SIZE/2; i < TEST_SIZE; i++)
                p.add(i);
        });
        t1.start();
        t2.start();
        t1.join();
        t2.join();
    }

    @org.junit.jupiter.api.Test
    void contains() throws InterruptedException {
        Thread t1, t2;
        t1 = new Thread(() -> {
            for (int i = 0; i < TEST_SIZE / 2 ; i++) {
                p.add(i);
                assertTrue(p.contains(i));
            }
        });
        t2 = new Thread(() -> {
            for (int i = TEST_SIZE/2; i < TEST_SIZE; i++) {
                p.add(i);
                assertTrue(p.contains(i));
            }
        });
        t1.start();
        t2.start();
        t1.join();
        t2.join();
    }

    @org.junit.jupiter.api.Test
    void add() throws InterruptedException {
        Thread t1, t2;
        t1 = new Thread(() -> {
            for (int i = 0; i < TEST_SIZE / 2 ; i++)
                p.add(i);
        });
        t2 = new Thread(() -> {
            for (int i = TEST_SIZE/2; i < TEST_SIZE; i++)
                p.add(i);
        });
        t1.start();
        t2.start();
        t1.join();
        t2.join();

        assertEquals(TEST_SIZE, p.size(), "Wrong number of elements!s");
    }

    @org.junit.jupiter.api.Test
    void addAll() throws InterruptedException {

        Thread t1, t2;
        t1 = new Thread(() -> {
            List<Integer> values = new ArrayList<>(TEST_SIZE/2);
            for (int i = 0; i < TEST_SIZE / 2 ; i++)
                values.add(i);
            p.addAll(values);
        });
        t2 = new Thread(() -> {
            List<Integer> values = new ArrayList<>(TEST_SIZE/2);
            for (int i = TEST_SIZE/2; i < TEST_SIZE ; i++)
                values.add(i);
            p.addAll(values);
        });
        t1.start();
        t2.start();
        t1.join();
        t2.join();

        assertEquals(TEST_SIZE, p.size(), "Wrong number of elements!");
    }

    @org.junit.jupiter.api.Test
    void clear() throws InterruptedException {
        Thread t1, t2;
        t1 = new Thread(() -> {
            for (int i = 0; i < TEST_SIZE / 2 ; i++)
                p.add(i);
        });
        t2 = new Thread(() -> {
            for (int i = TEST_SIZE/2; i < TEST_SIZE ; i++)
                p.add(i);
        });
        t1.start();
        t2.start();
        t1.join();
        t2.join();

        assertEquals(TEST_SIZE, p.size());
        this.p.clear();
        assertEquals(0, p.size());


        // Test concurrent clear and add
        t1 = new Thread(() -> {
            for (int i = 0; i < TEST_SIZE ; i++)
                p.add(i);
        });
        t2 = new Thread(() -> {
            p.clear();
        });
        t1.start();
        t2.start();
        t1.join();
        t2.join();
    }

    @org.junit.jupiter.api.Test
    void iterator() throws InterruptedException {

        for (int i = 0; i < TEST_SIZE ; i++)
            p.add(i);

        int count = 0;
        for (Integer e : p)
            count++;

        Assertions.assertEquals(TEST_SIZE, count, "Single thread operation should iterate all elements of list!");

        p = new ParallelList<>();
        Thread t1, t2;
        t1 = new Thread(() -> {
            for (int i = 0; i < TEST_SIZE ; i++)
                p.add(i);
        });
        t1.start();

        Thread.sleep(1);
        t2 = new Thread(() -> {
            // Iterate elements of list multiple times to test different phases
            for (int i = 0; i < 2; i++)
            {
                Iterator<Integer> it = p.iterator();

                Integer next = null;
                while (it.hasNext())
                {
                    next = it.next();
                    Assertions.assertNotEquals(null, next, "Iterator returned null element when it had next!");
                }
                try {
                    Thread.sleep(1);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        });
        t2.start();
        t1.join();
        t2.join();
    }
}