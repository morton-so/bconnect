package to.bconnect.api.core.presentation.v1.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import to.bconnect.api.common.Regex;
import to.bconnect.api.core.domain.project.UpdateProject;
import to.bconnect.api.storage.Address;

public record UpdateProjectRequest(
        @NotNull @Size(max = 50) @Pattern(regexp = Regex.NOT_BLANK) String title,
        @Valid @NotNull Address address
) {
    public UpdateProject toCommand() {
        return new UpdateProject(title, address);
    }
}
