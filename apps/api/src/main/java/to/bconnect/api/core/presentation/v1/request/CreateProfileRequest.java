package to.bconnect.api.core.presentation.v1.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import to.bconnect.api.core.domain.profile.CreateProfile;
import to.bconnect.api.storage.Address;
import to.bconnect.api.storage.profile.ProfileRole;
import to.bconnect.api.storage.profile.Trade;

import java.util.Set;

public record CreateProfileRequest(
        @NotNull ProfileRole role,
        @NotNull Trade primaryTrade,
        @NotEmpty @Size(max = 3) Set<Trade> trades,
        @Min(0) int experience,
        @Size(max = 50) String headline,
        @Size(max = 500) String about,
        @Valid @NotNull Address address
) {
    public CreateProfile toCommand() {
        return new CreateProfile(role, primaryTrade, trades, experience, headline, about, address);
    }
}
