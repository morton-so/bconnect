package to.bconnect.api.core.presentation.v1.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import to.bconnect.api.common.Regex;
import to.bconnect.api.core.domain.chat.CreateGroupChat;

import java.util.List;

public record CreateGroupChatRequest(
        @NotNull @Pattern(regexp = Regex.NOT_BLANK) String title,
        @NotEmpty @Size(min = 2) List<Long> participantIds
) {
    public CreateGroupChat toCommand() {
        return new CreateGroupChat(title, participantIds);
    }
}
