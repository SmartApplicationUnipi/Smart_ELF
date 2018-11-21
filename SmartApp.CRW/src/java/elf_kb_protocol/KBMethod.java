package elf_kb_protocol;

class KBMethod {
    private String method;
    private Object params;
    private String token;

    public KBMethod(String method, Object params, String token)
    {
        this.method = method;
        this.params = params;
        this.token = token;
    }
}
