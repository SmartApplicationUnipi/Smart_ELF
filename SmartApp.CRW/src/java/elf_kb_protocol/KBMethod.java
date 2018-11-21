package elf_kb_protocol;

class KBMethod {
    private String method;
    private Object params;

    public KBMethod(String method, Object params)
    {
        this.method = method;
        this.params = params;
    }
}
