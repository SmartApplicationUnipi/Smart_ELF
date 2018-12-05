package elf_crawler.stringvar;

import java.text.SimpleDateFormat;
import java.time.YearMonth;
import java.util.Calendar;
import java.util.LinkedList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class StringVarProcessor {
    private static final Calendar CALENDAR = Calendar.getInstance();
    private static final Pattern URL_VAR_PATTERN = Pattern.compile("\\{[\\w.]+}");

    private static SimpleDateFormat CURRENT_DATE_FORMAT = new SimpleDateFormat("dd/MM/yyyy");
    private static SimpleDateFormat MONTH_BEGIN_FORMAT = new SimpleDateFormat("1/MM/yyyy");

    public static String process(String url)
    {
        List<StringVar> variables = parseVariablesInUrl(url.toLowerCase());

        for (StringVar v : variables)
            url = url.replace(v.getVariable(), getVariableValue(v));

        return url;
    }

    private static List<StringVar> parseVariablesInUrl(String url)
    {
        List<StringVar> vars = new LinkedList<>();
        if (!url.contains("{"))
            return vars;

        Matcher m = URL_VAR_PATTERN.matcher(url);

        while (m.find()) {
            String var = m.group();
            // Escape the { and } characters
            StringVar sv = StringVar.fromVariableString(var);

            if (sv != null)
                vars.add(sv);
        }

        return vars;
    }

    private static String getVariableValue(StringVar v)
    {
        switch (v)
        {
            case DATE_CURRENT:
                return CURRENT_DATE_FORMAT.format(CALENDAR.getTime());
            case DATE_CURRENT_DAY:
                return String.valueOf(CALENDAR.get(Calendar.DAY_OF_MONTH));
            case DATE_CURRENT_MONTH:
                return String.valueOf(CALENDAR.get(Calendar.MONTH) + 1);
            case DATE_CURRENT_YEAR:
                return String.valueOf(CALENDAR.get(Calendar.YEAR));
            case DATE_CURRENT_MONTH_BEGIN:
                return MONTH_BEGIN_FORMAT.format(CALENDAR.getTime());
            case DATE_CURRENT_MONTH_END:
                int currentYear = CALENDAR.get(Calendar.YEAR);
                int currentMonth = CALENDAR.get(Calendar.MONTH)+1;
                YearMonth yearMonthObject = YearMonth.of(currentYear, currentMonth);
                SimpleDateFormat monthEndFormat = new SimpleDateFormat(yearMonthObject.lengthOfMonth() + "/MM/yyyy");
                return monthEndFormat.format(CALENDAR.getTime());
            case JAVA_VERSION:
                return System.getProperty("java.version");
        }

        return "";
    }

    public static void main(String[] args)
    {
        System.out.println(process("Crawler is running on Java {java.version}"));
    }

}
