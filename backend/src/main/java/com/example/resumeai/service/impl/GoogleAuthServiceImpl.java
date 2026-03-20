package com.example.resumeai.service.impl;

import com.example.resumeai.config.AppProperties;
import com.example.resumeai.exception.UnauthorizedException;
import com.example.resumeai.service.GoogleAuthService;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class GoogleAuthServiceImpl implements GoogleAuthService {

    private final String clientId;

    public GoogleAuthServiceImpl(AppProperties appProperties) {
        this.clientId = appProperties.getGoogle().getClientId();
    }

    @Override
    public GoogleUser verifyToken(String idTokenString) {

        try {

            GoogleIdTokenVerifier verifier =
                    new GoogleIdTokenVerifier.Builder(
                            GoogleNetHttpTransport.newTrustedTransport(),
                            GsonFactory.getDefaultInstance())
                            .setAudience(Collections.singletonList(clientId))
                            .build();

            GoogleIdToken idToken = verifier.verify(idTokenString);

            if (idToken == null) {
                throw new UnauthorizedException("Invalid Google token");
            }

            GoogleIdToken.Payload payload = idToken.getPayload();

            String sub = payload.getSubject();
            String email = payload.getEmail();
            String name = (String) payload.get("name");

            Boolean emailVerified = (Boolean) payload.getEmailVerified();
            if (!Boolean.TRUE.equals(emailVerified)) {
                throw new UnauthorizedException("Google email not verified");
            }

            return new GoogleUser(sub, email, name);

        } catch (Exception e) {
            throw new UnauthorizedException("Google token verification failed");
        }
    }
}