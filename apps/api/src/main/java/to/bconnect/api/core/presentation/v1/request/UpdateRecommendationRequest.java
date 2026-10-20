package to.bconnect.api.core.presentation.v1.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import to.bconnect.api.common.Regex;

public record UpdateRecommendationRequest(
        @NotNull @Pattern(regexp = Regex.NOT_BLANK) String content
) {}
