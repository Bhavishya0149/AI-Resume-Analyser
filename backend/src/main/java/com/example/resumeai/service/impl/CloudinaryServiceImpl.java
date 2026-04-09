package com.example.resumeai.service.impl;


import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.example.resumeai.exception.ApiException;
import com.example.resumeai.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.net.URLDecoder;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;


@Service
@RequiredArgsConstructor
public class CloudinaryServiceImpl implements CloudinaryService {


    private final Cloudinary cloudinary;


    @Override
    public String uploadFile(MultipartFile file, String folder) {
        try {
            String contentType = file.getContentType();
            boolean isDocument = contentType != null && (
                    contentType.equals("application/pdf") ||
                    contentType.equals("application/msword") ||
                    contentType.equals("application/vnd.openxmlformats-officedocument.wordprocessingml.document")
            );

            Map<?, ?> result;
            if (isDocument) {
                result = cloudinary.uploader()
                        .upload(file.getBytes(), ObjectUtils.asMap(
                                "resource_type", "raw",
                                "folder", folder
                        ));
                String url = result.get("secure_url").toString();
                return toViewableUrl(url, contentType);
            } else {
                result = cloudinary.uploader()
                        .upload(file.getBytes(), ObjectUtils.emptyMap());
                return result.get("secure_url").toString();
            }


        } catch (Exception e) {
            throw new ApiException("Cloudinary upload failed");
        }
    }


    @Override
    public void deleteFile(String url) {
        try {
            String cloudinaryUrl = extractCloudinaryUrl(url);

            boolean isRaw = cloudinaryUrl.contains("/raw/upload/");
            String resourceType = isRaw ? "raw" : "image";

            String publicId = extractPublicId(cloudinaryUrl, isRaw);

            cloudinary.uploader().destroy(publicId, ObjectUtils.asMap("resource_type", resourceType));

        } catch (Exception e) {
            throw new ApiException("Cloudinary delete failed");
        }
    }


    private String extractCloudinaryUrl(String url) {
        if (url.contains("view.officeapps.live.com")) {
            int idx = url.indexOf("?src=");
            if (idx != -1) {
                return URLDecoder.decode(url.substring(idx + 5), StandardCharsets.UTF_8);
            }
        }
        if (url.contains("docs.google.com/viewer")) {
            int idx = url.indexOf("?url=");
            if (idx != -1) {
                String encoded = url.substring(idx + 5);
                int ampIdx = encoded.indexOf("&");
                if (ampIdx != -1) encoded = encoded.substring(0, ampIdx);
                return URLDecoder.decode(encoded, StandardCharsets.UTF_8);
            }
        }
        return url;
    }

    private String extractPublicId(String cloudinaryUrl, boolean isRaw) {
        String[] parts = cloudinaryUrl.split("/upload/");
        if (parts.length > 1) {
            String path = parts[1];
            return isRaw ? path : path.substring(0, path.lastIndexOf("."));
        }
        
        String[] urlParts = cloudinaryUrl.split("/");
        String fileName = urlParts[urlParts.length - 1];
        return isRaw ? fileName : fileName.substring(0, fileName.lastIndexOf("."));
    }


    private String toViewableUrl(String url, String contentType) {
        String encoded = URLEncoder.encode(url, StandardCharsets.UTF_8);
        if (contentType != null && (
                contentType.equals("application/msword") ||
                contentType.equals("application/vnd.openxmlformats-officedocument.wordprocessingml.document"))) {
            
            return "https://view.officeapps.live.com/op/view.aspx?src=" + encoded;
        }
        
        return "https://docs.google.com/viewer?url=" + encoded + "&embedded=true";
    }
}