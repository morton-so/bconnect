package to.bconnect.api.core.presentation.v1.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import to.bconnect.api.common.Regex;
import to.bconnect.api.storage.member.Role;
import to.bconnect.api.core.domain.member.RegisterMember;

import java.time.LocalDate;
import java.util.Set;

public record RegisterMemberRequest(
        @NotNull @Size(min = 3, max = 30) @Pattern(regexp = Regex.USERNAME) String username,
        @NotNull @Size(max = 50) @Pattern(regexp = Regex.NOT_BLANK) String name,
        @NotNull LocalDate birth,
        @NotNull Boolean marketingConsent
) {
    public RegisterMember toCommand() {
        return new RegisterMember(username, name, birth, marketingConsent, Set.of(Role.GUEST));
    }
}
