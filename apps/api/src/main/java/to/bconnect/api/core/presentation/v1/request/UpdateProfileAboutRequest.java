package to.bconnect.api.core.presentation.v1.request;

import jakarta.validation.constraints.Size;

public record UpdateProfileAboutRequest(
        @Size(max = 500) String about
) {}
