package to.bconnect.api.core.presentation.v1.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import to.bconnect.api.common.Regex;
import to.bconnect.api.core.domain.task.UpdateAssigneeTask;
import to.bconnect.api.storage.task.TaskProgress;

public record UpdateAssigneeTaskRequest(
        @NotNull TaskProgress progress,
        @NotNull @Pattern(regexp = Regex.NOT_BLANK) String title,
        String memo
) {
    public UpdateAssigneeTask toCommand() {
        return new UpdateAssigneeTask(progress, title, memo);
    }
}
