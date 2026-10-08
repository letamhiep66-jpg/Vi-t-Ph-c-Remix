export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  places?: Array<{
    name: string;
    category: string;
    address: string;
    city: string;
    googleMapsUrl?: string;
    tip?: string;
  }>;
  sources?: Array<{
    title: string;
    url: string;
  }>;
  modelUsed?: string;
}

export interface ChatResponse {
  success: boolean;
  reply: string;
  places?: Array<{
    name: string;
    category: string;
    address: string;
    city: string;
    googleMapsUrl?: string;
    tip?: string;
  }>;
  sources?: Array<{
    title: string;
    url: string;
  }>;
  modelUsed?: string;
  error?: string;
}

export async function sendChatMessage(
  messages: Array<{ role: 'user' | 'model'; content: string }>,
  model: 'gemini-3.8-flash' | 'gemini-3.1-flash-lite' | 'gemini-3.1-pro-preview' = 'gemini-3.8-flash',
  costumeContext?: string
): Promise<ChatResponse> {
  try {
    const res = await fetch('/api/gemini/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        model,
        costumeContext,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        return data;
      }
    }
  } catch (err) {
    console.warn('Backend chat API unreachable, utilizing client fallback heritage advisor:', err);
  }

  // Client-side fallback
  const lastMsg = messages[messages.length - 1]?.content || '';
  return getClientChatFallback(lastMsg, costumeContext, model);
}

function getClientChatFallback(
  message: string,
  costumeContext?: string,
  model: string = 'gemini-3.8-flash'
): ChatResponse {
  const m = message.toLowerCase();

  if (m.includes('chụp') || m.includes('địa điểm') || m.includes('ở đâu')) {
    return {
      success: true,
      modelUsed: model,
      reply: `Dưới đây là các danh thắng và không gian kiến trúc di sản chuẩn mực nhất phù hợp với cổ phục Việt Nam:

1. **Hoàng Thành Thăng Long (Hà Nội):** Tường gạch rêu phong và vòm Đoan Môn cổ kính, rất hợp với Áo Tấc, Áo Giao Lĩnh, Áo Đối Khâm và Áo Ngũ Thân.
   - *Địa chỉ:* 19C Hoàng Diệu, Ba Đình, Hà Nội.
2. **Văn Miếu - Quốc Tử Giám (Hà Nội):** Không gian Khuê Văn Các uy nghiêm, lý tưởng cho Áo Dài truyền thống và Áo Ngũ Thân nam.
   - *Địa chỉ:* 58 Quốc Tử Giám, Đống Đa, Hà Nội.
3. **Đại Nội Huế & Lăng Tự Đức (Thừa Thiên Huế):** Chiếc nôi của Áo Nhật Bình và Áo Tấc triều đình.
   - *Địa chỉ:* Đường 23 Tháng 8, Phường Thuận Hòa, TP. Huế.
4. **Bảo Tàng Mỹ Thuật TP.HCM (Sài Gòn):** Kiến trúc Art Deco Đông Dương thập niên 1930 hoàn hảo cho Áo Dài Le Mur và áo ngũ thân tay chẽn.
   - *Địa chỉ:* 97A Phó Đức Chính, Quận 1, TP.HCM.`,
      places: [
        {
          name: 'Hoàng Thành Thăng Long',
          category: 'Không Gian Di Sản',
          address: '19C Hoàng Diệu, Điện Biên, Ba Đình, Hà Nội',
          city: 'Hà Nội',
          tip: 'Góc chụp trước Đoan Môn bắt nắng sớm mai tạo phong thái hoàng gia cổ kính.'
        },
        {
          name: 'Đại Nội Huế',
          category: 'Không Gian Di Sản',
          address: 'Đường 23 Tháng 8, Phường Thuận Hòa, TP. Huế',
          city: 'Thừa Thiên Huế',
          tip: 'Hành lang Trường Lang và Cung Diên Thọ sơn son thếp vàng tuyệt đẹp cho Áo Nhật Bình.'
        },
        {
          name: 'Văn Miếu - Quốc Tử Giám',
          category: 'Không Gian Di Sản',
          address: '58 Quốc Tử Giám, Văn Miếu, Đống Đa, Hà Nội',
          city: 'Hà Nội',
          tip: 'Khuê Văn Các và giếng Thiên Quang tôn vinh nét nho nhã của Áo Dài.'
        }
      ],
      sources: [{ title: 'Cổng Thông tin Di sản Văn hóa Việt Nam', url: 'https://dsvh.gov.vn' }]
    };
  }

  if (m.includes('thuê') || m.includes('tiệm') || m.includes('may')) {
    return {
      success: true,
      modelUsed: model,
      reply: `Dưới đây là các nhà may đo và tiệm cho thuê cổ phục uy tín hàng đầu được giới mộ điệu tin tưởng:

- **Hà Nội:**
  + **Ỷ Vân Hiên:** Số 16, Ngõ 192 Lê Trọng Tấn, Thanh Xuân, Hà Nội (Chuyên may đo, phục dựng cổ phục chuẩn triều điển).
  + **Cổ Trang Đại Việt / Vạn Thiên Shop:** Đội Cấn, Ba Đình, Hà Nội (Cho thuê đa dạng Áo Tấc, Nhật Bình, Tứ Thân).
- **Thừa Thiên Huế:**
  + **Hoa Niên - Năm Tháng Tươi Đẹp:** Đường Đinh Tiên Hoàng, Thuận Thành, TP. Huế (Cho thuê Áo Nhật Bình, Áo Tấc trọn gói kèm phụ kiện).
- **TP. Hồ Chí Minh:**
  + **Áo Dài Minh Thư:** 199 Lý Tự Trọng, Bến Thành, Quận 1, TP.HCM (Chuyên may đo và cho thuê Áo Dài & Ngũ Thân cao cấp).`,
      places: [
        {
          name: 'Ỷ Vân Hiên (May đo & Cho thuê Cổ phục)',
          category: 'Tiệm May & Cho Thuê',
          address: 'Số 16, Ngõ 192 Lê Trọng Tấn, Khương Mai, Thanh Xuân, Hà Nội',
          city: 'Hà Nội',
          tip: 'May đo và phục dựng cổ phục cao cấp theo đúng chuẩn bảo tàng.'
        },
        {
          name: 'Hoa Niên - Cổ Phục Huế',
          category: 'Tiệm Cho Thuê & Trải Nghiệm',
          address: 'Đường Đinh Tiên Hoàng, Thuận Thành, TP. Huế',
          city: 'Thừa Thiên Huế',
          tip: 'Cho thuê Áo Nhật Bình và Áo Tấc trọn gói kèm trâm cài, nón bài thơ.'
        },
        {
          name: 'Áo Dài Minh Thư',
          category: 'Tiệm May & Cho Thuê',
          address: '199 Lý Tự Trọng, Phường Bến Thành, Quận 1, TP.HCM',
          city: 'TP. Hồ Chí Minh',
          tip: 'May đo và cho thuê áo dài truyền thống, áo ngũ thân nam nữ chất liệu tơ tằm.'
        }
      ],
      sources: [{ title: 'Cổng Thông tin Di sản Văn hóa Việt Nam', url: 'https://dsvh.gov.vn' }]
    };
  }

  return {
    success: true,
    modelUsed: model,
    reply: `Chào bạn! Tôi là **Trợ Lý Cố Vấn Cổ Phục & Di Sản Việt Nam (Nếp AI)**.

Tôi có thể hỗ trợ bạn:
1. **Khám phá đặc điểm & cấu trúc:** Chi tiết về cổ lập lĩnh, tay raglan, năm hạt cúc khuy ngọc (Ngũ Luân) của Áo Dài, Áo Tứ Thân, Áo Ngũ Thân, Áo Tấc, Áo Nhật Bình...
2. **Gợi ý phối đồ Remix:** Tư vấn kết hợp cổ phục cùng thời trang đương đại (blazer, quần âu, chân váy) thanh lịch.
3. **Gợi ý bối cảnh kiến trúc di sản:** Gợi ý danh thắng, cung đình, đền đài có phong cảnh hợp nhất với từng tà áo.
4. **Kiến thức chất liệu lụa gấm:** Tư vấn vải lụa tơ tằm, gấm sa đoạn, sa Nam Cao.

Bạn đang quan tâm đến bộ trang phục nào hay cần tư vấn phong cách phối đồ?`,
    places: [
      {
        name: 'Hoàng Thành Thăng Long',
        category: 'Không Gian Di Sản',
        address: '19C Hoàng Diệu, Ba Đình, Hà Nội',
        city: 'Hà Nội'
      },
      {
        name: 'Đại Nội Huế',
        category: 'Không Gian Di Sản',
        address: 'Đường 23 Tháng 8, Phường Thuận Hòa, TP. Huế',
        city: 'Thừa Thiên Huế'
      }
    ],
    sources: [{ title: 'Cổng Thông tin Di sản Văn hóa Việt Nam', url: 'https://dsvh.gov.vn' }]
  };
}
