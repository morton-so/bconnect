package to.bconnect.api.core.presentation.v1.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import to.bconnect.api.common.Regex;
import to.bconnect.api.core.domain.member.UpdateMember;

public record UpdateMemberRequest(
        @NotNull @Size(max = 50) @Pattern(regexp = Regex.NOT_BLANK) String name
) {
    public UpdateMember toCommand() {
        return new UpdateMember(name);
    }
}
