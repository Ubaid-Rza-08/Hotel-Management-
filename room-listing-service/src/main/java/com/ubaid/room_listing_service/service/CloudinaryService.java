package com.ubaid.room_listing_service.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public String uploadImage(MultipartFile file, String folder) {
        try {
            Map<String, Object> uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", folder,
                            "resource_type", "auto",
                            "quality", "auto:good",
                            "fetch_format", "auto"
                    )
            );

            String imageUrl = (String) uploadResult.get("secure_url");
            log.info("Image uploaded successfully: {}", imageUrl);
            return imageUrl;

        } catch (IOException e) {
            log.error("Error uploading image to Cloudinary: {}", e.getMessage());
            throw new RuntimeException("Failed to upload image: " + e.getMessage());
        }
    }

    public boolean deleteImage(String imageUrl) {
        try {
            if (imageUrl == null || imageUrl.isEmpty()) {
                return false;
            }

            // Extract public_id from URL
            String publicId = extractPublicIdFromUrl(imageUrl);
            if (publicId == null) {
                log.warn("Could not extract public_id from URL: {}", imageUrl);
                return false;
            }

            Map<String, Object> result = cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            String resultStatus = (String) result.get("result");

            boolean deleted = "ok".equals(resultStatus);
            if (deleted) {
                log.info("Image deleted successfully: {}", imageUrl);
            } else {
                log.warn("Failed to delete image: {}, result: {}", imageUrl, resultStatus);
            }

            return deleted;

        } catch (Exception e) {
            log.error("Error deleting image from Cloudinary: {}", e.getMessage());
            return false;
        }
    }

    private String extractPublicIdFromUrl(String imageUrl) {
        try {
            // Extract public_id from Cloudinary URL
            // Format: https://res.cloudinary.com/{cloud_name}/image/upload/{transformations}/{public_id}.{format}
            if (!imageUrl.contains("cloudinary.com")) {
                return null;
            }

            String[] parts = imageUrl.split("/");
            for (int i = 0; i < parts.length; i++) {
                if ("upload".equals(parts[i]) && i + 1 < parts.length) {
                    // Get everything after upload/ and remove file extension
                    StringBuilder publicId = new StringBuilder();
                    for (int j = i + 1; j < parts.length; j++) {
                        if (j > i + 1) {
                            publicId.append("/");
                        }
                        publicId.append(parts[j]);
                    }

                    // Remove file extension
                    String result = publicId.toString();
                    int lastDot = result.lastIndexOf('.');
                    if (lastDot > 0) {
                        result = result.substring(0, lastDot);
                    }

                    return result;
                }
            }

            return null;
        } catch (Exception e) {
            log.error("Error extracting public_id from URL: {}", e.getMessage());
            return null;
        }
    }
}