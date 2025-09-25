package com.ubaid.hotel_listing_service.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public String uploadImage(MultipartFile file, String folder) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be null or empty");
        }

        if (file.getSize() > 5 * 1024 * 1024) {
            throw new IllegalArgumentException("File size too large. Maximum allowed size is 5MB.");
        }

        String publicId = folder + "/" + UUID.randomUUID().toString();

        Map<String, Object> uploadOptions = ObjectUtils.asMap(
                "public_id", publicId,
                "folder", folder,
                "resource_type", "image",
                "quality", "auto:good",
                "fetch_format", "auto"
        );

        try {
            Map uploadResult = cloudinary.uploader().upload(file.getBytes(), uploadOptions);
            String imageUrl = uploadResult.get("secure_url").toString();
            log.info("Image uploaded successfully to Cloudinary. Folder: {}, URL: {}", folder, imageUrl);
            return imageUrl;
        } catch (Exception e) {
            log.error("Failed to upload image to Cloudinary. Folder: {}, Error: {}", folder, e.getMessage());
            throw new IOException("Failed to upload image to Cloudinary: " + e.getMessage(), e);
        }
    }

    public List<String> uploadMultipleImages(List<MultipartFile> files, String folder) throws IOException {
        List<String> imageUrls = new ArrayList<>();

        for (MultipartFile file : files) {
            if (!file.isEmpty()) {
                String imageUrl = uploadImage(file, folder);
                imageUrls.add(imageUrl);
            }
        }

        return imageUrls;
    }

    public boolean deleteImage(String imageUrl) {
        if (imageUrl == null || !imageUrl.contains("cloudinary.com")) {
            return true;
        }

        try {
            String publicId = extractPublicIdFromUrl(imageUrl);
            if (publicId == null) {
                return false;
            }

            Map result = cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            String deletionResult = (String) result.get("result");
            return "ok".equals(deletionResult);
        } catch (Exception e) {
            log.error("Error deleting image from Cloudinary: {}", e.getMessage());
            return false;
        }
    }

    private String extractPublicIdFromUrl(String imageUrl) {
        try {
            String[] urlParts = imageUrl.split("/");
            if (urlParts.length < 8) {
                return null;
            }

            int versionIndex = -1;
            for (int i = 0; i < urlParts.length; i++) {
                if (urlParts[i].startsWith("v") && urlParts[i].length() > 1) {
                    String versionPart = urlParts[i].substring(1);
                    if (versionPart.matches("\\d+")) {
                        versionIndex = i;
                        break;
                    }
                }
            }

            if (versionIndex == -1 || versionIndex + 1 >= urlParts.length) {
                return null;
            }

            StringBuilder publicId = new StringBuilder();
            for (int i = versionIndex + 1; i < urlParts.length; i++) {
                if (i > versionIndex + 1) {
                    publicId.append("/");
                }

                String part = urlParts[i];
                if (i == urlParts.length - 1) {
                    int dotIndex = part.lastIndexOf('.');
                    if (dotIndex > 0) {
                        part = part.substring(0, dotIndex);
                    }
                }
                publicId.append(part);
            }

            return publicId.toString();
        } catch (Exception e) {
            return null;
        }
    }
}

