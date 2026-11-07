package com.jobtracker.dto.response;

public class CountItem {

    private final String label;
    private final long count;

    public CountItem(String label, long count) {
        this.label = label;
        this.count = count;
    }

    public String getLabel() { return label; }
    public long getCount() { return count; }
}
