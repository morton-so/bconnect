package to.bconnect.api.core.presentation.v1.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import to.bconnect.api.common.Regex;
import to.bconnect.api.core.domain.post.UpdatePost;

import java.util.List;

public record UpdatePostRequest(
        Long taskId,
        @NotEmpty List<Long> attachmentIds,
        @NotNull @Pattern(regexp = Regex.NOT_BLANK) String content
) {
    public UpdatePost toCommand() {
        return new UpdatePost(taskId, attachmentIds, content);
    }
}
