package to.bconnect.api.core.presentation.v1.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import to.bconnect.api.common.Regex;
import to.bconnect.api.core.domain.company.CreateCompany;

public record CreateCompanyRequest(
        @NotNull @Size(max = 50) @Pattern(regexp = Regex.NOT_BLANK) String name,
        @NotNull @Pattern(regexp = Regex.BRN) String brn,
        Long pictureId,
        @NotNull Long attachmentId
) {
    public CreateCompany toCommand() {
        return new CreateCompany(name, brn, pictureId, attachmentId);
    }
}
