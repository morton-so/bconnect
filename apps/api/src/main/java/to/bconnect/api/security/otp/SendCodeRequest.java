package to.bconnect.api.security.otp;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import to.bconnect.api.common.Regex;

public record SendCodeRequest(
        @NotNull
        @Pattern(regexp = Regex.PHONE)
        String phone
) {}
