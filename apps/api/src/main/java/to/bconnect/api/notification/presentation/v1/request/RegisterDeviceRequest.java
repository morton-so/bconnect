package to.bconnect.api.notification.presentation.v1.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import to.bconnect.api.common.Regex;
import to.bconnect.api.storage.device.DevicePlatform;

public record RegisterDeviceRequest(
        @NotNull @Pattern(regexp = Regex.NOT_BLANK) String token,
        @NotNull DevicePlatform platform
) {}
