package dev.robgro.timesheet.role;

import dev.robgro.timesheet.exception.ValidationException;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RoleServiceImpl implements RoleService {
    private final RoleRepository roleRepository;

    @Override
    @Transactional(readOnly = true)
    public Set<Role> getRolesByNames(Set<String> roleNames) {
        if (roleNames == null || roleNames.isEmpty()) {
            return Collections.emptySet();
        }

        return roleNames.stream()
                .map(this::getRoleByName)
                .collect(Collectors.toSet());
    }

    @Override
    @Transactional(readOnly = true)
    public Role getRoleByName(String roleName) {
        try {
            RoleName roleNameEnum = RoleName.valueOf(roleName);
            return roleRepository.findByName(roleNameEnum)
                    .orElseThrow(() -> new EntityNotFoundException("Role with name " + roleName + " not found"));
        } catch (IllegalArgumentException e) {
            log.error("Invalid role name: {}", roleName, e);
            throw new ValidationException("Invalid role name: " + roleName);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }
}
