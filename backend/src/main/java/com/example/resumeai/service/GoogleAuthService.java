package com.example.resumeai.service;

public interface GoogleAuthService {

    String verifyTokenAndGetEmail(String idToken);
}