package app.solyto.widget;

import java.util.Calendar;
import java.util.GregorianCalendar;
import java.util.TimeZone;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/** ISO 8601 timestamp parsing without java.time, which needs API 26. */
final class IsoTime {

    private static final Pattern ISO = Pattern.compile(
            "^(\\d{4})-(\\d{2})-(\\d{2})[T ](\\d{2}):(\\d{2})(?::(\\d{2})(?:\\.(\\d{1,9}))?)?"
                    + "(Z|[+-]\\d{2}(?::?\\d{2})?)$");

    private IsoTime() {}

    /** Epoch millis, or -1 when the value is missing or not an ISO timestamp with zone. */
    static long parse(String value) {
        if (value == null) return -1;
        Matcher m = ISO.matcher(value.trim());
        if (!m.matches()) return -1;

        try {
            Calendar calendar = new GregorianCalendar(TimeZone.getTimeZone("UTC"));
            calendar.setLenient(false);
            calendar.clear();
            calendar.set(Integer.parseInt(m.group(1)), Integer.parseInt(m.group(2)) - 1,
                    Integer.parseInt(m.group(3)), Integer.parseInt(m.group(4)),
                    Integer.parseInt(m.group(5)), m.group(6) != null ? Integer.parseInt(m.group(6)) : 0);
            if (m.group(7) != null) {
                String fraction = (m.group(7) + "00").substring(0, 3);
                calendar.set(Calendar.MILLISECOND, Integer.parseInt(fraction));
            }
            return calendar.getTimeInMillis() - offsetMillis(m.group(8));
        } catch (IllegalArgumentException e) {
            return -1;
        }
    }

    private static long offsetMillis(String zone) {
        if ("Z".equals(zone)) return 0;
        int sign = zone.charAt(0) == '-' ? -1 : 1;
        String digits = zone.substring(1).replace(":", "");
        int hours = Integer.parseInt(digits.substring(0, 2));
        int minutes = digits.length() > 2 ? Integer.parseInt(digits.substring(2, 4)) : 0;
        return sign * (hours * 3_600_000L + minutes * 60_000L);
    }
}
