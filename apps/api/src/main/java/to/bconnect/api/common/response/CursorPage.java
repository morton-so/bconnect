package to.bconnect.api.common.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.val;
import org.springframework.data.domain.Window;

import java.util.List;
import java.util.function.Function;

public record CursorPage<T>(
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) List<T> content,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) boolean hasNext,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) Long nextCursor
) {
    public static <T> CursorPage<T> from(Window<T> window, Function<T, Long> cursorExtractor) {
        val content = window.getContent();
        val hasNext = window.hasNext();
        val nextCursor = hasNext ? cursorExtractor.apply(content.getLast()) : null;
        return new CursorPage<>(content, hasNext, nextCursor);
    }
}
