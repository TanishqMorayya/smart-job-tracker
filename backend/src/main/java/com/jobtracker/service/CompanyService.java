package com.jobtracker.service;

import com.jobtracker.dto.request.CompanyRequest;
import com.jobtracker.dto.response.CompanyResponse;
import com.jobtracker.entity.Company;
import com.jobtracker.entity.User;
import com.jobtracker.exception.ConflictException;
import com.jobtracker.exception.DuplicateResourceException;
import com.jobtracker.exception.ResourceNotFoundException;
import com.jobtracker.repository.CompanyRepository;
import com.jobtracker.repository.JobApplicationRepository;
import com.jobtracker.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CompanyService {

    private final CompanyRepository companyRepository;
    private final JobApplicationRepository applicationRepository;
    private final UserRepository userRepository;

    public CompanyService(CompanyRepository companyRepository,
                          JobApplicationRepository applicationRepository,
                          UserRepository userRepository) {
        this.companyRepository = companyRepository;
        this.applicationRepository = applicationRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<CompanyResponse> list(String email, String search) {
        Long userId = userId(email);
        List<Company> companies = (search == null || search.isBlank())
                ? companyRepository.findByUserIdOrderByNameAsc(userId)
                : companyRepository.findByUserIdAndNameContainingIgnoreCaseOrderByNameAsc(
                        userId, search.trim());
        return companies.stream().map(CompanyResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public CompanyResponse get(String email, Long id) {
        return CompanyResponse.from(findOwned(email, id));
    }

    @Transactional
    public CompanyResponse create(String email, CompanyRequest req) {
        User user = userRepository.findByEmail(email).orElseThrow();
        String name = req.getName().trim();

        if (companyRepository.existsByUserIdAndNameIgnoreCase(user.getId(), name)) {
            throw new DuplicateResourceException("You already have a company named '" + name + "'");
        }

        Company c = new Company();
        c.setUser(user);
        apply(c, req, name);
        return CompanyResponse.from(companyRepository.save(c));
    }

    @Transactional
    public CompanyResponse update(String email, Long id, CompanyRequest req) {
        Company c = findOwned(email, id);
        String name = req.getName().trim();

        if (companyRepository.existsByUserIdAndNameIgnoreCaseAndIdNot(
                c.getUser().getId(), name, id)) {
            throw new DuplicateResourceException("You already have a company named '" + name + "'");
        }

        apply(c, req, name);
        return CompanyResponse.from(c);
    }

    @Transactional
    public void delete(String email, Long id) {
        Company c = findOwned(email, id);
        if (applicationRepository.existsByCompanyId(id)) {
            throw new ConflictException(
                    "Cannot delete this company because it has job applications. Delete those first.");
        }
        companyRepository.delete(c);
    }

    // Ownership check lives here: the query itself is scoped by user id.
    private Company findOwned(String email, Long id) {
        return companyRepository.findByIdAndUserId(id, userId(email))
                .orElseThrow(() -> new ResourceNotFoundException("Company not found"));
    }

    private Long userId(String email) {
        return userRepository.findByEmail(email).orElseThrow().getId();
    }

    private void apply(Company c, CompanyRequest req, String name) {
        c.setName(name);
        c.setWebsite(blankToNull(req.getWebsite()));
        c.setIndustry(blankToNull(req.getIndustry()));
        c.setLocation(blankToNull(req.getLocation()));
    }

    private String blankToNull(String s) {
        return (s == null || s.isBlank()) ? null : s.trim();
    }
}
