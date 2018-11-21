package jar;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class Logger {

    private static LogLevel logLevel = LogLevel.INFO;

    public static void setLogLevel(LogLevel value)
    {
        if (value == null)
            return;

        logLevel = value;
    }

    public static void warning(String message)
    {
        if (logLevel.ordinal() < LogLevel.WARN.ordinal())
            return;

        System.out.println(getPrefix() + " WARN: " + message);
    }

    public static void info(String message)
    {
        if (logLevel.ordinal() < LogLevel.INFO.ordinal())
            return;

        System.out.println(getPrefix() + " INFO: " + message);
    }

    public static void error(String message)
    {
        System.err.println(getPrefix() + " ERROR: " + message);
    }

    public static void critical(String message)
    {
        System.err.println(message);
        System.exit(-1);
    }

    private static String getPrefix()
    {
        String time = LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH:mm:ss"));

        return "[" + time + "]";
    }
}
