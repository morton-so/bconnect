package to.bconnect.api.oneclick.presentation.v1.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import to.bconnect.api.common.Regex;

// 원클릭 조회 요청
public record OneClickRequest(
        @NotNull @Pattern(regexp = Regex.BRN) String brn
) {
}
