
public class TestRegex {
    public static void main(String[] args) {
        String[] titles = {
            "EY36TTKT_471752404_1809474893198689_880596",
            "De_thi_giua_ki_2023_2024.pdf",
            "FB_IMG_1694523901234.jpg",
            "IMG_20230912_123456.png",
            "Screenshot_2023-10-15-10-20-30.png",
            "Bai-tap-lon-CSDL-Phan-Tan"
        };
        for (String t : titles) {
            String clean = t.replaceAll("(?i)\\.(pdf|docx?|pptx?|xlsx?|png|jpe?g|gif|txt)$", "");
            clean = clean.replace("_", " ").replace("-", " ");
            clean = clean.replaceAll("(?i)\\b(FB IMG|IMG|Screenshot|WhatsApp Image)\\b", "");
            clean = clean.replaceAll("\\b\\d{6,}\\b", "");
            clean = clean.replaceAll("\\s+", " ").trim();
            if (clean.isEmpty()) {
                clean = "Tài liệu";
            }
            if (clean.length() > 0) {
                clean = clean.substring(0, 1).toUpperCase() + clean.substring(1);
            }
            System.out.println(t + " -> " + clean);
        }
    }
}
