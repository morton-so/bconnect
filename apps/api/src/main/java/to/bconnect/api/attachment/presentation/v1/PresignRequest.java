package to.bconnect.api.attachment.presentation.v1;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import to.bconnect.api.attachment.domain.PresignFile;
import to.bconnect.api.common.Regex;
import to.bconnect.api.storage.attachment.AttachmentContext;
import to.bconnect.api.storage.attachment.AttachmentType;

import java.util.List;

public record PresignRequest(
        @NotNull AttachmentContext context,
        @NotNull AttachmentType type,
        @NotNull Long contextId,
        @NotEmpty @Valid List<FileItem> files
) {
    public record FileItem(
            @NotNull @Pattern(regexp = Regex.NOT_BLANK) String filename,
            @NotNull @Pattern(regexp = Regex.NOT_BLANK) String contentType,
            @NotNull @Min(1) Long size
    ) {
        public PresignFile toCommand() {
            return new PresignFile(filename, contentType, size);
        }
    }

    public List<PresignFile> toCommands() {
        return files.stream().map(FileItem::toCommand).toList();
    }
}
