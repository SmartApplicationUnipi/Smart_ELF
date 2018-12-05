package elf_crawler.stringvar;

public enum StringVar {
    DATE_CURRENT("{date.current}"),
    DATE_CURRENT_DAY("{date.current.day}"),
    DATE_CURRENT_MONTH("{date.current.month}"),
    DATE_CURRENT_YEAR("{date.current.year}"),
    DATE_CURRENT_MONTH_BEGIN("{date.current.month.begin}"),
    DATE_CURRENT_MONTH_END("{date.current.month.end}"),
    JAVA_VERSION("{java.version}"),
            ;

    private final String variable;
    StringVar(final String variable){
        this.variable = variable;
    };

    public String getVariable()
    {
        return this.variable;
    }

    public static StringVar fromVariableString(String str)
    {
        for (StringVar v : StringVar.values())
            if (v.variable.equals(str))
                return v;

        return null;
    }
}
