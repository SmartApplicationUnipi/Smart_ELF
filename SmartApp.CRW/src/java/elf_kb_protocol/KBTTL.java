package elf_kb_protocol;

import com.google.gson.annotations.SerializedName;

public enum KBTTL {

    @SerializedName("1")
    SESSION(1),

    @SerializedName("2")
    DAY(2),

    @SerializedName("3")
    MONTH(3),

    @SerializedName("4")
    SEMESTER(4),

    @SerializedName("5")
    ACADEMIC_YEAR(5),

    @SerializedName("6")
    ETERNAL(6);


    private final int number;
    KBTTL(final int number){
        this.number = number;
    };
}
