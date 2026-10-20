package to.bconnect.api.common;

public class Regex {
    public static final String ZIP_CODE = "^\\d{5}$";
    public static final String BCODE = "^\\d{10}$";
    public static final String BRN = "^\\d{10}$";
    public static final String PHONE = "^01\\d{8,9}$";
    public static final String OTP_CODE = "^\\d{6}$";
    public static final String NOT_BLANK = "^[\\s\\S]*\\S[\\s\\S]*$";
    public static final String USERNAME = "^[a-zA-Z0-9_.-]+$";
}
