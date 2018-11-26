package elf_crawler;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.google.gson.stream.JsonReader;

import java.io.FileNotFoundException;
import java.io.FileReader;
import java.lang.reflect.Type;
import java.util.HashSet;
import java.util.Set;

public class URLSet extends HashSet<String> {

    private static final Gson gson = new Gson();

    public URLSet(String filename) throws FileNotFoundException {
        super.addAll(readURLSet(filename));
    }

    private static final Type URL_SET_TYPE =
            new TypeToken<Set<String>>(){}.getType();
    private static Set<String> readURLSet(String filename) throws FileNotFoundException {
        JsonReader reader = new JsonReader(new FileReader(filename));

        return gson.fromJson(reader, URL_SET_TYPE);
    }

}
