package to.bconnect.api.security.jwt;

import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.util.Assert;

import java.util.Collection;
import java.util.Collections;
import java.util.Date;

import static to.bconnect.api.security.jwt.JwtType.ACCESS;
import static to.bconnect.api.security.jwt.JwtType.REFRESH;

public class JwtAuthenticationToken extends AbstractAuthenticationToken {

    /**
     * UserDetails
     */
    private final Object principal;

    /**
     * jwt
     */
    private Object credentials;

    private final JwtType type;

    private final Date expiration;

    public JwtAuthenticationToken(Object credentials) {
        super(Collections.emptySet());
        this.principal = null;
        this.credentials = credentials;
        this.type = null;
        this.expiration = null;
        super.setAuthenticated(false);
    }

    public JwtAuthenticationToken(Object principal, Object credentials,
                                  JwtType type, Collection<? extends GrantedAuthority> authorities) {
        this(principal, credentials, type, null, authorities);
    }

    public JwtAuthenticationToken(Object principal, Object credentials,
                                  JwtType type, Date expiration, Collection<? extends GrantedAuthority> authorities) {
        super(authorities);
        this.principal = principal;
        this.credentials = credentials;
        this.type = type;
        this.expiration = expiration;
        super.setAuthenticated(true);
    }

    @Override
    public Object getCredentials() {
        return this.credentials;
    }

    @Override
    public Object getPrincipal() {
        return this.principal;
    }

    public boolean isAccessToken() {
        return ACCESS.equals(this.type);
    }

    public boolean isRefreshToken() {
        return REFRESH.equals(this.type);
    }

    public Date getExpiration() {
        return this.expiration;
    }

    @Override
    public void setAuthenticated(boolean isAuthenticated) throws IllegalArgumentException {
        Assert.isTrue(!isAuthenticated,
                "Cannot set this token to trusted - use constructor which takes a GrantedAuthority list instead");
        super.setAuthenticated(false);
    }

    @Override
    public void eraseCredentials() {
        super.eraseCredentials();
        this.credentials = null;
    }
}
