package com.unidocs.service;

import org.springframework.web.multipart.MultipartFile;

public interface StorageService {
    // Upload a MultipartFile to storage and return its public URL
    String uploadFile(MultipartFile file, String filename);

    // Upload a byte array to storage and return its public URL
    String uploadFile(byte[] bytes, String filename, String contentType);

    // Upload a java.io.File to storage and return its public URL
    String uploadFile(java.io.File file, String filename, String contentType);

    // Delete a file from storage by filename
    void deleteFile(String filename);
}
