package com.unidocs.util;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.rendering.ImageType;
import org.apache.pdfbox.rendering.PDFRenderer;

import javax.imageio.IIOImage;
import javax.imageio.ImageIO;
import javax.imageio.ImageWriteParam;
import javax.imageio.ImageWriter;
import javax.imageio.stream.ImageOutputStream;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.Iterator;

public class PdfThumbnailUtil {

    /**
     * Generates a JPEG thumbnail of the first page of a PDF.
     * @param pdfInputStream InputStream of the PDF file.
     * @return byte array of the JPEG thumbnail, or null if generation fails.
     */
    public static byte[] generateThumbnail(InputStream pdfInputStream) {
        java.io.File tempFile = null;
        try {
            tempFile = java.io.File.createTempFile("pdf-thumb-", ".pdf");
            try (java.io.FileOutputStream fos = new java.io.FileOutputStream(tempFile)) {
                byte[] buffer = new byte[8192];
                int read;
                while ((read = pdfInputStream.read(buffer)) != -1) {
                    fos.write(buffer, 0, read);
                }
            }
            try (PDDocument document = Loader.loadPDF(tempFile)) {
                if (document.getNumberOfPages() > 0) {
                PDFRenderer pdfRenderer = new PDFRenderer(document);
                // Render first page at 72 DPI (low resolution for thumbnail)
                BufferedImage bim = pdfRenderer.renderImageWithDPI(0, 72, ImageType.RGB);
                
                // Compress as JPEG
                ByteArrayOutputStream baos = new ByteArrayOutputStream();
                Iterator<ImageWriter> writers = ImageIO.getImageWritersByFormatName("jpg");
                if (!writers.hasNext()) {
                    return null;
                }
                
                ImageWriter writer = writers.next();
                try (ImageOutputStream ios = ImageIO.createImageOutputStream(baos)) {
                    writer.setOutput(ios);
                    ImageWriteParam param = writer.getDefaultWriteParam();
                    if (param.canWriteCompressed()) {
                        param.setCompressionMode(ImageWriteParam.MODE_EXPLICIT);
                        param.setCompressionQuality(0.75f); // 75% quality for small size
                    }
                    writer.write(null, new IIOImage(bim, null, null), param);
                } finally {
                    writer.dispose();
                }
                
                return baos.toByteArray();
            }
            }
        } catch (Exception e) {
            e.printStackTrace();
            // Fallback: return null if thumbnail generation fails
        } finally {
            if (tempFile != null && tempFile.exists()) {
                tempFile.delete();
            }
        }
        return null;
    }
}
