package to.bconnect.api.oneclick.presentation.v1.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import to.bconnect.api.common.Regex;
import to.bconnect.api.oneclick.domain.ValidateBusiness;

import java.time.LocalDate;

// 사업자 진위확인 요청
public record ValidateBusinessRequest(
        @NotNull @Pattern(regexp = Regex.BRN) String brn,
        @NotNull @Size(max = 50) @Pattern(regexp = Regex.NOT_BLANK) String ownerName,
        @NotNull @PastOrPresent LocalDate openedAt
) {
    public ValidateBusiness toCommand() {
        return new ValidateBusiness(brn, ownerName, openedAt);
    }
}
