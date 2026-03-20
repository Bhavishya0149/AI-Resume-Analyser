package com.example.resumeai.service;

public interface GoogleAuthService {

    GoogleUser verifyToken(String idToken);

    class GoogleUser {

        private final String sub;
        private final String email;
        private final String name;

        public GoogleUser(String sub, String email, String name) {
            this.sub = sub;
            this.email = email;
            this.name = name;
        }

        public String getSub() {
            return sub;
        }

        public String getEmail() {
            return email;
        }

        public String getName() {
            return name;
        }
    }
}