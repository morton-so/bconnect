package to.bconnect.api.core.presentation.v1.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import to.bconnect.api.core.domain.profile.UpdateProfile;
import to.bconnect.api.storage.Address;
import to.bconnect.api.storage.profile.ProfileRole;
import to.bconnect.api.storage.profile.Trade;

import java.util.Set;

public record UpdateProfileRequest(
        @NotNull ProfileRole role,
        @NotNull Trade primaryTrade,
        @NotEmpty @Size(max = 3) Set<Trade> trades,
        @Min(0) int experience,
        @Size(max = 50) String headline,
        @Valid @NotNull Address address
) {
    public UpdateProfile toCommand() {
        return new UpdateProfile(role, primaryTrade, trades, experience, headline, address);
    }
}
