package elf_crawler;

import elf_crawler.crawler.*;
import elf_crawler.relationship.RelationshipSet;
import elf_crawler.util.Logger;
import elf_crawler.util.MimeType;

import java.io.*;
import java.net.URL;
import java.net.URLConnection;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * An object that manages and assigns crawlers for the assigned URLs
 * in the URL set. The manager will use as many threads as available
 * by the CPU, therefore exploiting all the parallelism it can.
 * <p>
 * An URL set is the set of all links that the manager will perform
 * crawling on. If new links are discovered, they will also be
 * crawled until a certain depth. In order to not crawl any new url
 * that wasn't initially provided, the user can pass a max
 * crawling depth of 1. Notice that for each crawled document, the
 * amount of newly found links grows exponentially, on average, so
 * a huge depth may cause the system to run out of memory or take
 * an exponential amount of time.
 * <p>
 * A relationship set tells how to build a <class>DataEntry</class>
 * given the contents of the download files. Currently, the Crawlers
 * support HTML, JSON and CVS files. The file types have to be
 * specified in the URL set.
 *
 * @see elf_crawler.relationship.RelationshipSet  RelationshipSet
 * @see elf_crawler.crawler.DataEntry DataEntry
 */
public class CrawlingManager {
    public static final String CRAWLER_DATA_ENTRY_TAG = "CRAWLER_DATA_ENTRY";

    private static final int INITIAL_URL_SET_SCALE = 2;
    private static final int EXPECTED_NEW_URLS = 10;
    private static final int DEFAULT_MAX_CRAWLING_DEPTH = 1;
    public static final String[] ACCEPTED_PROTOCOLS = {"https", "http"};

    private int maxCrawlingDepth;
    private Set<CrawlerAddress> crawlerAddressSet;
    // New urls discovered while crawling
    private Set<String> newUrls;
    private BlockingQueue<CrawlerAddress> crawlerAddressQueue;
    private DataAggregator aggregator;
    // Executor that runs each elf_crawler in parallel
    private ExecutorService executor;
    private AtomicInteger workingCrawlers;
    private RelationshipSet rs;

    /**
     * Initializes the crawler manager with a default depth of 2
     * and the given urlSet and relationship set.
     *
     * @param urlSet the set of all URLs to perform crawling on
     * @param rs     the relationship set
     */
    public CrawlingManager(URLSet urlSet, RelationshipSet rs) {
        this(urlSet, rs, -1, -1);
    }

    /**
     * Initializes the crawler manager with given max crawling depth,
     * given urlSet and relationship set.
     *
     * @param urlSet           the set of all URLs to perform crawling on
     * @param rs               the relationship set
     *
     * @param maxCrawlingDepth the maximum depth that the crawlers will
     *                         work on, starting from the URL sets. For
     *                         example, if the URL set has an URL U1 and
     *                         that URL contains URLs inside, say U2, then
     *                         U1 has a depth of 0 and U2 has a depth of 1.
     *                         A max crawling depth of 1 would discard U2.
     * @param threads          The amount of Crawlers that can run in
     *                         parallel.
     */
    public CrawlingManager(Set<String> urlSet, RelationshipSet rs, int maxCrawlingDepth, int threads) {
        this.rs = rs;

        // Create as many threads as processor cores in this machine
        int processors = threads > 0 ? threads : Runtime.getRuntime().availableProcessors();
        this.maxCrawlingDepth = maxCrawlingDepth > 0 ? maxCrawlingDepth : DEFAULT_MAX_CRAWLING_DEPTH;
        this.crawlerAddressSet = new HashSet<>(urlSet.size() * INITIAL_URL_SET_SCALE);
        this.newUrls = new HashSet<>(EXPECTED_NEW_URLS);
        this.crawlerAddressQueue = new LinkedBlockingQueue<>(EXPECTED_NEW_URLS);
        this.aggregator = new DataAggregator();
        this.workingCrawlers = new AtomicInteger(0);
        this.executor = Executors.newFixedThreadPool(processors);

        // Add initial links
        for (String url : urlSet)
            crawlerAddressSet.add(new CrawlerAddress(url, 0));

        for (CrawlerAddress l : this.crawlerAddressSet) addCrawlingTask(l);
    }

    public List<DataEntry> executeAllCrawlers() throws ExecutionException, InterruptedException {
        // We expect that the total amount of links is the amount of initial links powered to the max crawling depth
        //Map<String, List<RdfRelation>> crawledRDF = new HashMap<>((int)Math.pow(this.crawlerAddressSet.size(), DEFAULT_MAX_CRAWLING_DEPTH));

        while (this.workingCrawlers.get() > 0) {
            while (this.crawlerAddressQueue.size() > 0) {
                CrawlerAddress l = this.crawlerAddressQueue.take();
                addCrawlingTask(l);
            }
        }

        return this.aggregator.aggregate();
    }

    public void shutdown() {
        this.executor.shutdown();
    }

    public boolean hasNewLinks() {
        return this.newUrls.size() > 0;
    }

    public int getNewLinkCount() {
        return this.newUrls.size();
    }

    public List<String> getAllUrls() {
        List<String> urls = new ArrayList<>(this.crawlerAddressSet.size());

        for (CrawlerAddress l : this.crawlerAddressSet)
            urls.add(l.getUrl());

        return urls;
    }

    private void addCrawlingTask(CrawlerAddress crawlerAddress) {
        this.executor.submit(() -> {
            try {
                // First download the file
                DownloadedFile df = downloadFile(crawlerAddress);

                // Given the content type of the document, assign corresponding Crawler
                Crawler c;
                switch (df.getContentType()) {
                    case html:
                        c = new HTMLCrawler(df, this.rs);
                        break;
                    case json:
                        c = new JSONCrawler(df, this.rs);
                        break;
                    case csv:
                        c = new CSVCrawler(df, this.rs);
                        break;
                    default:
                        return;
                }

                // Harvest data from the Web
                CrawledData data = c.crawl();

                if (data == null)
                    return;

                // Add everything to the aggregator
                this.aggregator.addData(data.getDataEntries());

                // Add new discovered links if they haven't been crawled yet
                if (df.getCrawlerAddress().getDepth() + 1 < this.maxCrawlingDepth)
                    for (CrawlerAddress l : data.getDiscoveredAddresses())
                        if (!this.crawlerAddressSet.contains(l)) {
                            this.crawlerAddressQueue.add(l);
                            this.newUrls.add(crawlerAddress.getUrl());
                        }

            }
            catch (Exception e) {
                Logger.exception(e);
            }
            finally {
                this.workingCrawlers.decrementAndGet();
            }
        });

        this.workingCrawlers.incrementAndGet();
    }

    public DownloadedFile downloadFile(CrawlerAddress crawlerAddress) throws IOException {

        URL urlobj = new URL(crawlerAddress.getUrl());
        URLConnection con = urlobj.openConnection();

        BufferedReader in = new BufferedReader(
                new InputStreamReader(con.getInputStream()));

        StringBuilder sb = new StringBuilder();
        String line = in.readLine();
        while (line != null) {
            sb.append(line);
            sb.append("\n");
            line = in.readLine();
        }
        in.close();

        String contentHeader = con.getHeaderField("Content-Type");
        return new DownloadedFile(crawlerAddress, sb.toString(), getContentType(contentHeader, crawlerAddress.getUrl()));
    }

    private static String getContentType(String header, String url)
    {
        if (header != null)
            return getContentTypeFromHeader(header);

        MimeType t = MimeType.valueOf(url.substring(url.lastIndexOf(".") + 1, url.length()));
        return t.toString();
    }

    // Removes the "; encoding=..." from the content type string
    private static String getContentTypeFromHeader(String contentType) {
        int firstSemicolon = contentType.indexOf(";");
        if (firstSemicolon > 0)
            contentType = contentType.substring(0, firstSemicolon);
        return contentType;
    }
}
