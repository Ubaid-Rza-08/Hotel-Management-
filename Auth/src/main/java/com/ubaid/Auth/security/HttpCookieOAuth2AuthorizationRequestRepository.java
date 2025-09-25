package com.ubaid.Auth.security;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.web.AuthorizationRequestRepository;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;
import org.springframework.stereotype.Component;
import org.springframework.util.Assert;
import org.springframework.util.SerializationUtils;

import java.util.Base64;

@Component
@Slf4j
public class HttpCookieOAuth2AuthorizationRequestRepository implements AuthorizationRequestRepository<OAuth2AuthorizationRequest> {

    public static final String OAUTH2_AUTHORIZATION_REQUEST_COOKIE_NAME = "oauth2_auth_request";
    public static final String REDIRECT_URI_PARAM_COOKIE_NAME = "redirect_uri";
    private static final int COOKIE_EXPIRE_SECONDS = 180;

    @Override
    public OAuth2AuthorizationRequest loadAuthorizationRequest(HttpServletRequest request) {
        Assert.notNull(request, "request cannot be null");
        return getCookie(request, OAUTH2_AUTHORIZATION_REQUEST_COOKIE_NAME)
                .map(this::deserialize)
                .orElse(null);
    }

    @Override
    public void saveAuthorizationRequest(OAuth2AuthorizationRequest authorizationRequest,
                                         HttpServletRequest request,
                                         HttpServletResponse response) {
        Assert.notNull(request, "request cannot be null");
        Assert.notNull(response, "response cannot be null");

        if (authorizationRequest == null) {
            deleteCookie(request, response, OAUTH2_AUTHORIZATION_REQUEST_COOKIE_NAME);
            deleteCookie(request, response, REDIRECT_URI_PARAM_COOKIE_NAME);
            return;
        }

        Cookie cookie = new Cookie(OAUTH2_AUTHORIZATION_REQUEST_COOKIE_NAME, serialize(authorizationRequest));
        cookie.setPath("/");
        cookie.setHttpOnly(true);
        cookie.setMaxAge(COOKIE_EXPIRE_SECONDS);
        // Don't set Secure=true for localhost development
        cookie.setSecure(false);

        response.addCookie(cookie);

        String redirectUriAfterLogin = request.getParameter("redirect_uri");
        if (redirectUriAfterLogin != null && !redirectUriAfterLogin.isBlank()) {
            Cookie redirectUriCookie = new Cookie(REDIRECT_URI_PARAM_COOKIE_NAME, redirectUriAfterLogin);
            redirectUriCookie.setPath("/");
            redirectUriCookie.setHttpOnly(true);
            redirectUriCookie.setMaxAge(COOKIE_EXPIRE_SECONDS);
            redirectUriCookie.setSecure(false);
            response.addCookie(redirectUriCookie);
        }

        log.debug("Saved OAuth2 authorization request to cookie");
    }

    @Override
    public OAuth2AuthorizationRequest removeAuthorizationRequest(HttpServletRequest request,
                                                                 HttpServletResponse response) {
        Assert.notNull(request, "request cannot be null");
        Assert.notNull(response, "response cannot be null");

        OAuth2AuthorizationRequest authorizationRequest = loadAuthorizationRequest(request);
        if (authorizationRequest != null) {
            deleteCookie(request, response, OAUTH2_AUTHORIZATION_REQUEST_COOKIE_NAME);
            deleteCookie(request, response, REDIRECT_URI_PARAM_COOKIE_NAME);
            log.debug("Removed OAuth2 authorization request from cookie");
        }
        return authorizationRequest;
    }

    public String getRedirectUri(HttpServletRequest request) {
        return getCookie(request, REDIRECT_URI_PARAM_COOKIE_NAME)
                .map(Cookie::getValue)
                .orElse(null);
    }

    private java.util.Optional<Cookie> getCookie(HttpServletRequest request, String name) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null && cookies.length > 0) {
            for (Cookie cookie : cookies) {
                if (cookie.getName().equals(name)) {
                    return java.util.Optional.of(cookie);
                }
            }
        }
        return java.util.Optional.empty();
    }

    private void deleteCookie(HttpServletRequest request, HttpServletResponse response, String name) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null && cookies.length > 0) {
            for (Cookie cookie : cookies) {
                if (cookie.getName().equals(name)) {
                    Cookie cookieToDelete = new Cookie(name, "");
                    cookieToDelete.setPath("/");
                    cookieToDelete.setHttpOnly(true);
                    cookieToDelete.setMaxAge(0);
                    cookieToDelete.setSecure(false);
                    response.addCookie(cookieToDelete);
                }
            }
        }
    }

    private String serialize(OAuth2AuthorizationRequest object) {
        return Base64.getUrlEncoder().encodeToString(SerializationUtils.serialize(object));
    }

    private OAuth2AuthorizationRequest deserialize(Cookie cookie) {
        return (OAuth2AuthorizationRequest) SerializationUtils.deserialize(
                Base64.getUrlDecoder().decode(cookie.getValue()));
    }
}