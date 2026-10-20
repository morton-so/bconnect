package to.bconnect.api.core.presentation.v1.request;

import to.bconnect.api.common.CodeException;
import to.bconnect.api.common.CommonExceptionCode;
import to.bconnect.api.common.Regex;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import to.bconnect.api.core.domain.task.CreateProjectTask;
import to.bconnect.api.storage.profile.Trade;

import java.time.LocalDate;
import java.util.Set;

public record CreateProjectTaskRequest(
        @NotEmpty Set<Trade> trades,
        @NotNull LocalDate start,
        @NotNull LocalDate end,
        @NotNull Long projectId,
        @NotNull @Pattern(regexp = Regex.NOT_BLANK) String title,
        String requirement,
        String memo
) {
    public CreateProjectTask toCommand() {
        if (end.isBefore(start))
            throw new CodeException(CommonExceptionCode.NOT_VALID);

        return new CreateProjectTask(trades, start, end, projectId, title, requirement, memo);
    }
}
