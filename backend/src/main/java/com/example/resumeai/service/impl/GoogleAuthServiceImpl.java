package com.example.resumeai.service.impl;

import com.example.resumeai.config.AppProperties;
import com.example.resumeai.exception.UnauthorizedException;
import com.example.resumeai.service.GoogleAuthService;
import com.google.api.client.googleapis.auth.oauth2.*;
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
    public String verifyTokenAndGetEmail(String idTokenString) {

        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    GoogleNetHttpTransport.newTrustedTransport(),
                    GsonFactory.getDefaultInstance())
                    .setAudience(Collections.singletonList(clientId))
                    .build();

            GoogleIdToken idToken = verifier.verify(idTokenString);

            if (idToken == null) {
                throw new UnauthorizedException("Invalid Google token");
            }

            GoogleIdToken.Payload payload = idToken.getPayload();

            return payload.getEmail();

        } catch (Exception e) {
            throw new UnauthorizedException("Google token verification failed");
        }
    }
}