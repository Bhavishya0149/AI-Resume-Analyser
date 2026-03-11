package com.example.resumeai.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Data
@ConfigurationProperties(prefix = "app")
public class AppProperties {

    private Jwt jwt;
    private Resume resume;
    private TempInput tempInput;
    private Otp otp;
    private Leaderboard leaderboard;
    private Google google;
    private FileConfig profilePicture;

    @Data
    public static class Jwt {
        private String secret;
        private long expirationMs;
    }

    @Data
    public static class Resume {
        private int maxCount;
        private long maxSizeBytes;
    }

    @Data
    public static class TempInput {
        private long maxSizeBytes;
    }

    @Data
    public static class Otp {
        private int expiryMinutes;
        private int maxAttempts;
        private int resendDelaySeconds;
    }

    @Data
    public static class Leaderboard {
        private int maxUserEntries;
    }

    @Data
    public static class Google {
        private String clientId;
    }


    @Data
    public static class FileConfig {
        private long maxSizeBytes;
    }
}