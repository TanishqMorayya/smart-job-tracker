package com.jobtracker.dto.response;

import com.jobtracker.entity.Company;

public class CompanyResponse {

    private final Long id;
    private final String name;
    private final String website;
    private final String industry;
    private final String location;

    public CompanyResponse(Long id, String name, String website, String industry, String location) {
        this.id = id;
        this.name = name;
        this.website = website;
        this.industry = industry;
        this.location = location;
    }

    public static CompanyResponse from(Company c) {
        return new CompanyResponse(c.getId(), c.getName(), c.getWebsite(),
                c.getIndustry(), c.getLocation());
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getWebsite() { return website; }
    public String getIndustry() { return industry; }
    public String getLocation() { return location; }
}
