package to.bconnect.api.core.presentation.v1.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import to.bconnect.api.common.Regex;

public record UpdateNoteRequest(
        @NotNull @Pattern(regexp = Regex.NOT_BLANK) String content
) {}
