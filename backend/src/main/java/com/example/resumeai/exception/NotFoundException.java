package com.example.resumeai.exception;

public class NotFoundException extends ApiException {
    public NotFoundException(String message) {
        super(message);
    }
}