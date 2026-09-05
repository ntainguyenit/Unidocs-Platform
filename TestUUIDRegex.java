
public class TestUUIDRegex {
    public static void main(String[] args) {
        String[] titles = {
            "7b3b6231-a2b1-4a97-8799-61857c73f08f",
            "IMG_7b3b6231-a2b1-4a97-8799-61857c73f08f.png",
            "EY36TTKT_471752404_1809474893198689_880596",
            "89e335ee-1785563190211"
        };
        for (String title : titles) {
            String clean = title.replaceAll("(?i)\\.(pdf|docx?|pptx?|xlsx?|png|jpe?g|gif|txt)$", "");
            
            // Xóa UUID
            clean = clean.replaceAll("(?i)[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}", "");
            
            // Xóa hash/chuỗi alphanum dài hoặc timestamp-ID (VD: 89e335ee-1785563190211)
            // Thay vì cố bắt chính xác, ta xóa luôn các từ chứa cả số và chữ dài > 8 ký tự, 
            // hoặc chứa các cụm timestamp dài
            clean = clean.replaceAll("(?i)\\b[a-f0-9]{8,}\\b", ""); // Xóa các chuỗi hex dài >= 8
            
            clean = clean.replace("_", " ").replace("-", " ");
            clean = clean.replaceAll("(?i)\\b(FB IMG|IMG|Screenshot|WhatsApp Image|Doc|Document)\\b", "");
            clean = clean.replaceAll("\\b\\d{6,}\\b", "");
            clean = clean.replaceAll("\\s+", " ").trim();
            
            if (clean.isEmpty()) {
                clean = "Tài liệu"; // Fallback
            }
            if (clean.length() > 0) {
                clean = clean.substring(0, 1).toUpperCase() + clean.substring(1);
            }
            System.out.println(title + " -> " + clean);
        }
    }
}
