package to.bconnect.api.security.session;

import lombok.RequiredArgsConstructor;
import lombok.val;
import org.springframework.stereotype.Component;
import to.bconnect.api.security.AuthUser;
import to.bconnect.api.security.jwt.JwtProvider;

import java.util.Date;

@Component
@RequiredArgsConstructor
public class AuthTokenIssuer {

    private final JwtProvider jwtProvider;
    private final SessionService sessionService;

    public IssuedTokens login(AuthUser user, String agent, String ip) {
        val accessToken = jwtProvider.generateAccessToken(user);
        val refreshToken = jwtProvider.generateRefreshToken(user.getUsername());

        sessionService.login(user.getUsername(), agent, ip, refreshToken);

        return new IssuedTokens(accessToken, refreshToken);
    }

    public IssuedTokens rotate(AuthUser user, Date expiration) {
        val accessToken = jwtProvider.generateAccessToken(user);
        val refreshToken = jwtProvider.generateRefreshToken(user.getUsername(), expiration);

        sessionService.rotate(user.getUsername(), refreshToken);

        return new IssuedTokens(accessToken, refreshToken);
    }
}
