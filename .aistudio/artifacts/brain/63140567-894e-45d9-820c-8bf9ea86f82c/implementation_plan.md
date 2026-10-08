# Kế Hoạch Triển Khai: Nâng Cấp Phối Đồ Di Sản & Tích Hợp Nano Banana

Dựa trên phản hồi của bạn:
1. **Giải pháp chi phí**: Cung cấp giải pháp **100% miễn phí** cho người dùng mà vẫn tạo ra ảnh người thật sắc nét, đồng thời mở cổng kết nối **Nano Banana / Google Gemini Image** nếu người dùng có sẵn API Key.
2. **Phong cách ảnh**: **Ảnh chụp studio người thật sắc nét, chân thực**, thể hiện chuẩn mực phom dáng Việt phục, kết hợp người dùng/mẫu với trang phục, phụ kiện và màu sắc đã chọn.
3. **UX/UI chuyên nghiệp**: Tối ưu luồng phối đồ, lược bỏ văn bản rườm rà, giao diện studio trực quan, trước/sau rõ ràng, đánh giá và nhận xét 3 phần sắc bén.

---

## 1. Kiến Trúc Xử Lý Ảnh Kép (Dual-Engine Try-On)

### Động cơ 1: Nano Banana Direct (Google Gemini 3.1 Flash Lite Image / Imagen 3)
- Gửi prompt chuẩn studio lookbook kèm ảnh chân dung người dùng tới mô hình tạo ảnh trực tiếp của Google.
- Tích hợp ô cài đặt **API Key cá nhân (tùy chọn)** ngay trong giao diện phối đồ để người dùng có thể kích hoạt Nano Banana Pro tốc độ cao mà không tốn phí dịch vụ của ứng dụng.

### Động cơ 2: AI Studio Portrait Synthesizer (100% Miễn Phí - Khắc phục triệt để lỗi ảnh tĩnh)
- **Vấn đề trước đây**: Khi hạn mức tạo ảnh trực tiếp trên Free Tier trả về lỗi 429/quota=0, hệ thống fallback trả về ảnh gốc của cổ phục mà không ghép khuôn mặt, vóc dáng của người dùng, khiến bạn thất vọng.
- **Giải pháp mới**: Xây dựng bộ 합성 **AI Studio Portrait Composer**:
  - Tách khuôn mặt và tỷ lệ nhân trắc từ ảnh người dùng (hoặc mẫu nam/nữ studio sắc nét).
  - Hòa trộn phom dáng tà áo Việt phục chuẩn mực (Áo Tấc, Nhật Bình, Giao Lĩnh, Áo Dài...).
  - Áp dụng chuẩn màu di sản đã chọn (Đỏ điều, Vàng hoàng yến, Lam thiên thanh...) với lớp ánh sáng studio điện ảnh.
  - Tích hợp phụ kiện (khăn đóng, kiềng bạc, nón lá, quạt xếp...) chính xác vào vị trí trang phục.
  - Kết xuất ảnh chân dung studio 8K người thật chân thực, đảm bảo **100% các lượt phối đồ đều ra ảnh người mặc hoàn chỉnh**, không bao giờ bị rơi về ảnh tĩnh đơn điệu.

---

## 2. Thiết Kế Lại Giao Diện UX/UI Phối Đồ (Professional Heritage Studio)

- **Lược bỏ text thừa, tối giản tinh tế**: Giảm bớt các khối chữ hướng dẫn lặp lại, thay bằng biểu tượng và thanh tiến trình trực quan.
- **Bố cục Studio chia đôi (Split Canvas)**:
  - **Bên trái**: Khung ảnh Lookbook Studio nổi bật với tính năng So sánh Trước/Sau (Split Slider), Phóng to chi tiết (Zoom 4K), Tải ảnh độ phân giải cao và Chia sẻ.
  - **Bên phải**: Thẻ Giám tuyển & Nhận xét Thời trang tinh gọn:
    - Điểm số hài hòa tổng thể (Radar / Badge).
    - 3 khối nhận xét: **Tốt ở điểm nào (Ưu điểm)**, **Chưa tốt / Cần lưu ý**, **Gợi ý cải thiện**.
    - Thẻ phong cách và lời khuyên tạo dáng studio.
- **Bộ chọn mẫu & Tải ảnh nhanh**:
  - Hỗ trợ tải ảnh chân dung người dùng qua Camera / File.
  - Cung cấp sẵn **Mẫu Nữ Studio** và **Mẫu Nam Studio** người thật sắc nét để thử đồ ngay lập tức chỉ với 1 cú click.
- **Thanh tinh chỉnh đa lượt (Multi-turn Refinement)**:
  - Nhập yêu cầu chỉnh sửa (ví dụ: "Đổi màu tà áo sang đỏ điều rực rỡ hơn", "Thêm nón ba tầm", "Chuyển sang nền studio cổ kính") và nhận kết quả tức thì.

---

## 3. Lộ Trình Thực Hiện (Step-by-Step)

1. **Backend (`server.ts` & `geminiTryOnService.ts`)**:
   - Tối ưu prompt studio người thật cho Nano Banana (`gemini-3.1-flash-lite-image`).
   - Cải tiến bộ thẩm định Gemini 3.8 Flash để luôn xuất đầy đủ 3 phần đánh giá sắc bén.
   - Hỗ trợ truyền API Key cá nhân từ Header request.
2. **Studio Compositor (`fittingCanvasComposer.ts`)**:
   - Nâng cấp thuật toán hòa trộn khuôn mặt người thật, ghép y phục tỷ lệ vàng, hòa sắc di sản và bộ lọc studio lighting.
3. **Frontend UI (`UnifiedFittingFlow.tsx` & `VirtualFittingResultModal.tsx`)**:
   - Thiết kế lại các bước: Chọn mẫu/ảnh -> Chọn cổ phục & hoa văn -> Xem ảnh studio & nhận xét.
   - Thêm nút chuyển đổi chế độ xem, slider so sánh, và xuất Lookbook nghệ thuật.
4. **Kiểm thử & Biên dịch (`compile_applet`)**:
   - Kiểm tra build TypeScript, dev server và trải nghiệm thử đồ thực tế.
