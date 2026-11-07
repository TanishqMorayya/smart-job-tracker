package com.jobtracker.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class CompanyRequest {

    @NotBlank(message = "Company name is required")
    @Size(max = 150, message = "Company name must be at most 150 characters")
    private String name;

    @Size(max = 255, message = "Website must be at most 255 characters")
    @Pattern(regexp = "^$|^https?://.+", message = "Website must start with http:// or https://")
    private String website;

    @Size(max = 100, message = "Industry must be at most 100 characters")
    private String industry;

    @Size(max = 150, message = "Location must be at most 150 characters")
    private String location;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getWebsite() { return website; }
    public void setWebsite(String website) { this.website = website; }
    public String getIndustry() { return industry; }
    public void setIndustry(String industry) { this.industry = industry; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
}
