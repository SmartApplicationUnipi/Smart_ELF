package jar;

import elf_crawler.CrawlingManager;
import elf_crawler.URLSet;
import elf_crawler.crawler.DataEntry;
import elf_crawler.relationship.RelationshipSet;
import elf_kb_protocol.Fact;
import elf_kb_protocol.KBConnection;
import elf_kb_protocol.KBTTL;

import java.net.SocketTimeoutException;
import java.util.LinkedList;
import java.util.List;

public class JarMain {

    private static final String USAGE_STRING = "Supported flags:\n" +
            "-d <max crawling depth>: the maximum depth that will be crawled.\n" +
            "-h: prints help\n" +
            "-host <address>: the host address of the Knowledge Base\n" +
            "-log,l <1, 2, 3, error, warn, fine>: sets the logger value. Each number has the same meaning as its respective string. Example: a log level of '1' is the same as 'error'.\n" +
            "-r <filename>: relationship set location (required)\n" +
            "-s <filename>: url set location (required)\n" +
            "-t <numthreads>: how many threads to use in the Crawler. Default is the amount of threads in the CPU";

    private static int maxCrawlingDepth = 1;
    private static int threads = Runtime.getRuntime().availableProcessors();
    private static String rsFilename = null;
    private static String urlsetFilename = null;
    private static String KBHost = null;
    private static int KBPort = -1;

    public static void main(String[] args) throws Exception {
        List<Argument> arg = parseArgs(args);
        processArgs(arg);

        Logger.info(String.format("Using %d threads and a maximum crawling depth of %d.", threads, maxCrawlingDepth));

        RelationshipSet rs = new RelationshipSet(rsFilename);
        URLSet urlSet = new URLSet(urlsetFilename);
        CrawlingManager cm = new CrawlingManager(urlSet, rs, maxCrawlingDepth, threads);
        List<DataEntry> dataEntries = cm.executeAllCrawlers();
        cm.shutdown();

        Logger.info("Crawler finished!");
        Logger.info(String.format("Crawled has discovered %d new links.", cm.getNewLinkCount()));

        Logger.info("Attempting to create a connection to KB");
        try {
            KBConnection con = new KBConnection(KBHost, KBPort);
            Logger.info("Registering Crawler!");
            con.register();
            Logger.info("Crawler entity registered!");
            for (DataEntry d: dataEntries) {
                if (d == null) continue;

                d.setTag(CrawlingManager.CRAWLER_DATA_ENTRY_TAG);
                Logger.info("Added entry: " + d);
                con.addFact(new Fact(CrawlingManager.CRAWLER_DATA_ENTRY_TAG, KBTTL.DAY, 100, true, d));
            }

            con.closeConnection();

        }
        catch (SocketTimeoutException e) {
            Logger.error(String.format("Could not establish connection to: %s:%d", KBHost, KBPort));
            System.exit(-1);
        }

        Logger.info("Crawler has ended successfully!");
    }

    private static void processArgs(List<Argument> arg) {
        if (arg.isEmpty())
            Logger.critical(USAGE_STRING);

        for (Argument a : arg)
        {
            switch (a.flag)
            {
                case "d":
                    if (a.values.size() != 1)
                        Logger.critical("Usage:\n-d <max-crawling-depth> The maximum depth to crawl for.");

                    maxCrawlingDepth = Integer.parseInt(a.values.get(0));

                    if (threads <= 0)
                        Logger.critical("Max crawling depth must be positive");

                    break;
                case "h":
                    System.out.println(USAGE_STRING);
                    System.exit(0);
                case "host":
                    switch (a.values.size())
                    {
                        case 2:
                            KBPort = Integer.parseInt(a.values.get(1));
                        case 1:
                            KBHost = a.values.get(0);
                            break;
                        default:
                            Logger.critical("Usage:\n-host <hostname> <port>");
                    }

                    break;
                case "l":
                case "log":
                    LogLevel l = LogLevel.fromString(a.values.get(0));
                    if (l == null)
                        Logger.critical("Usage:\n-log,l <1, 2, 3, error, warn, fine>: sets the logger value.");

                    Logger.setLogLevel(LogLevel.fromString(a.values.get(0)));
                    break;
                case "r":
                    if (a.values.size() != 1)
                        Logger.critical("Usage:\n-r <relationship.json location>");
                    rsFilename = a.values.get(0);

                    break;
                case "s":
                    if (a.values.size() != 1)
                        error("Usage:\n-s <urlset.json location>");
                    urlsetFilename = a.values.get(0);

                    break;
                case "t":
                    if (a.values.size() != 1)
                        Logger.critical("Usage:\n-t <numthreads>");

                    threads = Integer.parseInt(a.values.get(0));

                    if (threads <= 0)
                        Logger.critical("Number of threads must be positive");

                    break;
                default:
                    Logger.critical(String.format("Unrecognized flag %s. ", a.flag) + USAGE_STRING);
            }
        }

        if (rsFilename == null)
            Logger.critical("Missing relationshipSet.json location. Please provide the location using the flag -r <filename>");

        if (urlsetFilename == null)
            Logger.critical("Missing urlset.json location. Please provide the location using the flag -u <url>");

        if (KBHost == null)
        {
            Logger.info("No KB host provided! Assuming locahost.");
            KBHost = "ws://localhost";
        }

        if (KBPort < 0)
        {
            Logger.info("No KB port provided! Assuming default port 5666.");
            KBPort = 5666;
        }
    }

    private static void warning(String message)
    {
        System.out.println(message);
    }

    private static void error(String message)
    {
        System.err.println(message);
        System.exit(-1);
    }

    private static List<Argument> parseArgs(String[] args)
    {
        List<Argument> arg = new LinkedList<>();
        Argument a = null;
        for (String s : args)
        {
            if (s.startsWith("-")) {
                a = new Argument(s.substring(1, s.length()));
                arg.add(a);
            }
            else if (a != null) {
                if (s.startsWith("\""))
                    s = s.substring(1, s.length());
                if (s.endsWith("\""))
                    s = s.substring(0, s.length()-1);
                a.values.add(s);
            }
        }

        return arg;
    }

    static class Argument {
        String flag;
        List<String> values;

        public Argument(String flag) {
            this.flag = flag;
            this.values = new LinkedList<>();
        }

        @Override
        public String toString() {
            return "-" + flag + " " + values.toString();
        }
    }
}
