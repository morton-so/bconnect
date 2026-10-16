package to.bconnect.api.storage;

import jakarta.persistence.Embeddable;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import to.bconnect.api.common.Regex;

import java.math.BigDecimal;

@Embeddable
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class Address {
    @NotNull
    @Pattern(regexp = Regex.ZIP_CODE)
    private String zipcode;

    @NotNull
    @Pattern(regexp = Regex.BCODE)
    private String bcode;

    @NotNull
    @Enumerated(EnumType.STRING)
    private Region state;

    @NotNull
    @Pattern(regexp = Regex.NOT_BLANK)
    private String city;

    @NotNull
    @Pattern(regexp = Regex.NOT_BLANK)
    private String street;

    private String detail;

    @NotNull
    private BigDecimal latitude;

    @NotNull
    private BigDecimal longitude;
}
