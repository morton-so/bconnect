package to.bconnect.api.core.presentation.v1.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import to.bconnect.api.common.CodeException;
import to.bconnect.api.common.CommonExceptionCode;
import to.bconnect.api.common.Regex;
import to.bconnect.api.core.domain.board.CreateNote;
import to.bconnect.api.storage.board.BoardType;

public record CreateNoteRequest(
        @NotNull BoardType type,
        Long projectId,
        Long driveId,
        @NotNull @Pattern(regexp = Regex.NOT_BLANK) String content
) {
    public CreateNote toCommand() {
        if (type == BoardType.PROJECT && projectId == null)
            throw new CodeException(CommonExceptionCode.NOT_VALID);
        if (type == BoardType.DRIVE && driveId == null)
            throw new CodeException(CommonExceptionCode.NOT_VALID);

        return new CreateNote(type, projectId, driveId, content);
    }
}
