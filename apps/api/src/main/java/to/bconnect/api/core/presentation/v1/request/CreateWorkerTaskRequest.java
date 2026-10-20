package to.bconnect.api.core.presentation.v1.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import to.bconnect.api.common.CodeException;
import to.bconnect.api.common.CommonExceptionCode;
import to.bconnect.api.common.Regex;
import to.bconnect.api.core.domain.task.CreateWorkerTask;
import to.bconnect.api.storage.Address;
import to.bconnect.api.storage.profile.Trade;

import java.time.LocalDate;
import java.util.Set;

public record CreateWorkerTaskRequest(
        @NotEmpty Set<Trade> trades,
        @NotNull LocalDate start,
        @NotNull LocalDate end,
        @NotNull @Pattern(regexp = Regex.NOT_BLANK) String title,
        String memo,
        String company,
        @Valid Address address
) {
    public CreateWorkerTask toCommand() {
        if (end.isBefore(start))
            throw new CodeException(CommonExceptionCode.NOT_VALID);

        return new CreateWorkerTask(trades, start, end, title, memo, company, address);
    }
}
