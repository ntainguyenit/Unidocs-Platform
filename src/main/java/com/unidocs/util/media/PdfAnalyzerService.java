package com.unidocs.util.media;

import org.springframework.stereotype.Service;
import java.io.InputStream;

@Service
public class PdfAnalyzerService {
    public boolean isValidPdfHeader(byte[] headerBytes) {
        if (headerBytes == null || headerBytes.length < 4) return false;
        // PDF Magic Number: %PDF (0x25 0x50 0x44 0x46)
        return headerBytes[0] == 0x25 && headerBytes[1] == 0x50 
            && headerBytes[2] == 0x44 && headerBytes[3] == 0x46;
    }
    
    public int estimatePageCount(long fileSizeInBytes) {
        // Very rough estimation: 50KB per page
        if (fileSizeInBytes <= 0) return 0;
        return (int) Math.max(1, fileSizeInBytes / 51200);
    }
}
