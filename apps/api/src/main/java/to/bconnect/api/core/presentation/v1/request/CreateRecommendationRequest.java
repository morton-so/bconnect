package to.bconnect.api.core.presentation.v1.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import to.bconnect.api.common.Regex;
import to.bconnect.api.core.domain.recommendation.CreateRecommendation;

public record CreateRecommendationRequest(
        @NotNull Long toId,
        @NotNull @Pattern(regexp = Regex.NOT_BLANK) String content
) {
    public CreateRecommendation toCommand() {
        return new CreateRecommendation(toId, content);
    }
}
