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
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CompanyServiceTest {

    private static final String EMAIL = "a@b.com";

    @Mock
    private CompanyRepository companyRepository;
    @Mock
    private JobApplicationRepository applicationRepository;
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private CompanyService companyService;

    // User has no setId(), so the id is set with reflection (test-only).
    private User userWithId(long id) {
        User u = new User();
        u.setEmail(EMAIL);
        ReflectionTestUtils.setField(u, "id", id);
        return u;
    }

    private CompanyRequest request(String name) {
        CompanyRequest r = new CompanyRequest();
        r.setName(name);
        return r;
    }

    @Test
    void createTrimsNameAndLinksCompanyToTheUser() {
        User user = userWithId(1L);
        when(userRepository.findByEmail(EMAIL)).thenReturn(Optional.of(user));
        when(companyRepository.existsByUserIdAndNameIgnoreCase(1L, "Google")).thenReturn(false);
        when(companyRepository.save(any(Company.class))).thenAnswer(inv -> inv.getArgument(0));

        CompanyResponse response = companyService.create(EMAIL, request("  Google "));

        ArgumentCaptor<Company> captor = ArgumentCaptor.forClass(Company.class);
        verify(companyRepository).save(captor.capture());
        assertEquals("Google", captor.getValue().getName());
        assertSame(user, captor.getValue().getUser());
        assertEquals("Google", response.getName());
    }

    @Test
    void createDuplicateNameThrowsAndSavesNothing() {
        when(userRepository.findByEmail(EMAIL)).thenReturn(Optional.of(userWithId(1L)));
        when(companyRepository.existsByUserIdAndNameIgnoreCase(1L, "Google")).thenReturn(true);

        assertThrows(DuplicateResourceException.class,
                () -> companyService.create(EMAIL, request("Google")));

        verify(companyRepository, never()).save(any());
    }

    @Test
    void getCompanyOfAnotherUserIsNotFound() {
        when(userRepository.findByEmail(EMAIL)).thenReturn(Optional.of(userWithId(1L)));
        // the ownership query finds nothing: company 5 belongs to someone else
        when(companyRepository.findByIdAndUserId(5L, 1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> companyService.get(EMAIL, 5L));
    }

    @Test
    void deleteCompanyThatHasApplicationsIsBlocked() {
        when(userRepository.findByEmail(EMAIL)).thenReturn(Optional.of(userWithId(1L)));
        when(companyRepository.findByIdAndUserId(5L, 1L)).thenReturn(Optional.of(new Company()));
        when(applicationRepository.existsByCompanyId(5L)).thenReturn(true);

        assertThrows(ConflictException.class, () -> companyService.delete(EMAIL, 5L));

        verify(companyRepository, never()).delete(any());
    }

    @Test
    void deleteCompanyWithoutApplicationsWorks() {
        Company company = new Company();
        when(userRepository.findByEmail(EMAIL)).thenReturn(Optional.of(userWithId(1L)));
        when(companyRepository.findByIdAndUserId(5L, 1L)).thenReturn(Optional.of(company));
        when(applicationRepository.existsByCompanyId(5L)).thenReturn(false);

        companyService.delete(EMAIL, 5L);

        verify(companyRepository).delete(company);
    }
}
