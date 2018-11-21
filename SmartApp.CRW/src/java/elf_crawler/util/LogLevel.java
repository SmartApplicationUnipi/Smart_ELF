package elf_crawler.util;

public enum LogLevel {
    ERROR, WARN, INFO;


    public static LogLevel fromString(String s)
    {
        try {
            LogLevel l = LogLevel.valueOf(s.toUpperCase());
            return l;
        } catch (IllegalArgumentException e) {
            int i = Integer.parseInt(s) -1;

            for (LogLevel l : LogLevel.values())
                if (l.ordinal() == i)
                    return l;
        }

        return null;
    }
}
