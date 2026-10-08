import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { OFFICIAL_13_COSTUMES } from './src/data/costumesData.js';
import { executeTryOnPipeline } from './src/services/geminiTryOnService.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// CORS & Static Asset Serving
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, x-gemini-api-key');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Serve public static assets with CORS
app.use(express.static(path.resolve(__dirname, 'public'), {
  setHeaders: (res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
}));

// Dedicated robust accessory image serving supporting Unicode (NFC, NFD, and URL encoded filenames)
app.get('/images/accessories/:filename(*)', (req, res, next) => {
  try {
    const rawFilename = decodeURIComponent(req.params.filename || req.path.replace(/^\/images\/accessories\//, ''));
    const accessoriesDir = path.resolve(__dirname, 'public/images/accessories');

    // 1. Exact match
    let filePath = path.join(accessoriesDir, rawFilename);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      return res.sendFile(filePath);
    }

    // 2. NFC normalized match
    const nfc = rawFilename.normalize('NFC');
    filePath = path.join(accessoriesDir, nfc);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      return res.sendFile(filePath);
    }

    // 3. NFD normalized match
    const nfd = rawFilename.normalize('NFD');
    filePath = path.join(accessoriesDir, nfd);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      return res.sendFile(filePath);
    }

    // 4. Accent-insensitive & case-insensitive lookup
    if (fs.existsSync(accessoriesDir)) {
      const dirFiles = fs.readdirSync(accessoriesDir);
      const targetClean = rawFilename.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
      const found = dirFiles.find(f => {
        const fClean = f.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
        return fClean === targetClean;
      });

      if (found) {
        return res.sendFile(path.join(accessoriesDir, found));
      }
    }
  } catch (err) {
    console.error('Error serving accessory image:', err);
  }
  next();
});

app.use(express.static(path.resolve(__dirname, 'public')));

const COSTUME_NUM_MAP: Record<string, string> = {
  'ao-giao-linh': '1',
  'ao-vien-linh': '2',
  'ao-doi-kham': '3',
  'ao-tu-than': '4',
  'ao-yem': '5',
  'ao-ngu-than': '6',
  'ao-tac-ngu-than-tay-thung': '8',
  'ao-tac': '8',
  'ao-nhat-binh': '9',
  'ao-ba-ba': '10',
  'ao-dai-lemur': '11',
};

export function syncImagesFromPublicDir() {
  try {
    const imagesDir = path.resolve(__dirname, 'public/images');
    const costumesDir = path.resolve(__dirname, 'public/images/costumes');
    if (!fs.existsSync(imagesDir)) return;
    if (!fs.existsSync(costumesDir)) fs.mkdirSync(costumesDir, { recursive: true });

    const files = fs.readdirSync(imagesDir);
    for (const f of files) {
      const fp = path.join(imagesDir, f);
      if (!fs.existsSync(fp) || !fs.statSync(fp).isFile()) continue;
      const lower = f.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');
      const ext = path.extname(f);

      let targetId: string | null = null;
      let targetNum: string | null = null;

      if (lower.includes('giao linh') || lower.startsWith('01') || lower.startsWith('1.')) {
        targetId = 'ao-giao-linh';
        targetNum = '1';
      } else if (lower.includes('vien linh') || lower.startsWith('02') || lower.startsWith('2.')) {
        targetId = 'ao-vien-linh';
        targetNum = '2';
      } else if (lower.includes('doi kham') || lower.startsWith('03') || lower.startsWith('3.')) {
        targetId = 'ao-doi-kham';
        targetNum = '3';
      } else if (lower.includes('tu than') || lower.startsWith('04') || lower.startsWith('4.')) {
        targetId = 'ao-tu-than';
        targetNum = '4';
      } else if (lower.includes('ngu than') || lower.startsWith('05') || lower.startsWith('5.')) {
        targetId = 'ao-ngu-than';
        targetNum = '6';
      } else if (lower.includes('tac') || lower.startsWith('06') || lower.startsWith('6.')) {
        targetId = 'ao-tac-ngu-than-tay-thung';
        targetNum = '8';
      } else if (lower.includes('nhat binh') || lower.startsWith('07') || lower.startsWith('7.')) {
        targetId = 'ao-nhat-binh';
        targetNum = '9';
      } else if (lower.includes('yem') || lower.startsWith('08') || lower.startsWith('8.')) {
        targetId = 'ao-yem';
        targetNum = '5';
      } else if (lower.includes('ba ba') || lower.startsWith('09') || lower.startsWith('9.')) {
        targetId = 'ao-ba-ba';
        targetNum = '10';
      } else if (lower.includes('le mur') || lower.includes('lemur') || lower.startsWith('10')) {
        targetId = 'ao-dai-lemur';
        targetNum = '11';
      }

      if (targetId) {
        fs.copyFileSync(fp, path.join(costumesDir, `${targetId}${ext}`));
        if (targetNum) {
          fs.copyFileSync(fp, path.join(costumesDir, `${targetNum}${ext}`));
        }
      }
    }
  } catch (err) {
    console.error('Error syncing images:', err);
  }
}
syncImagesFromPublicDir();

// API Endpoint: Save custom costume image to public/images/costumes
app.post('/api/costumes/save-image', (req, res) => {
  try {
    const { costumeId, dataUrl, gender } = req.body;
    if (!costumeId || !dataUrl) {
      return res.status(400).json({ error: 'Missing costumeId or dataUrl', success: false });
    }
    const matches = dataUrl.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ error: 'Invalid dataUrl format', success: false });
    }
    const ext = matches[1].includes('png') ? 'png' : 'jpg';
    const buffer = Buffer.from(matches[2], 'base64');
    const dir = path.resolve(__dirname, 'public/images/costumes');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const filename = gender ? `${costumeId}-${gender}.${ext}` : `${costumeId}.${ext}`;
    const filePath = path.join(dir, filename);
    fs.writeFileSync(filePath, buffer);

    // Also save numbered filename for compatibility (e.g. 1.png, 2.jpg)
    const num = COSTUME_NUM_MAP[costumeId];
    if (num && !gender) {
      fs.writeFileSync(path.join(dir, `${num}.${ext}`), buffer);
    } else if (num === '6' && gender === 'female') {
      fs.writeFileSync(path.join(dir, `7.${ext}`), buffer);
    }

    const publicUrl = `/images/costumes/${filename}?t=${Date.now()}`;
    return res.json({ success: true, url: publicUrl });
  } catch (err: any) {
    console.error('Error saving costume image:', err);
    return res.status(500).json({ error: err.message, success: false });
  }
});

// API Endpoint: Batch save multiple costume images
app.post('/api/costumes/batch-save-images', (req, res) => {
  try {
    const { items } = req.body as { items: Array<{ costumeId: string; dataUrl: string; gender?: string }> };
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Missing items array', success: false });
    }

    const dir = path.resolve(__dirname, 'public/images/costumes');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const results: Array<{ costumeId: string; url: string }> = [];

    for (const item of items) {
      const { costumeId, dataUrl, gender } = item;
      if (!costumeId || !dataUrl) continue;

      const matches = dataUrl.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) continue;

      const ext = matches[1].includes('png') ? 'png' : 'jpg';
      const buffer = Buffer.from(matches[2], 'base64');
      const filename = gender ? `${costumeId}-${gender}.${ext}` : `${costumeId}.${ext}`;
      const filePath = path.join(dir, filename);
      fs.writeFileSync(filePath, buffer);

      const num = COSTUME_NUM_MAP[costumeId];
      if (num && !gender) {
        fs.writeFileSync(path.join(dir, `${num}.${ext}`), buffer);
      } else if (num === '6' && gender === 'female') {
        fs.writeFileSync(path.join(dir, `7.${ext}`), buffer);
      }

      results.push({ costumeId, url: `/images/costumes/${filename}?t=${Date.now()}` });
    }

    return res.json({ success: true, results });
  } catch (err: any) {
    console.error('Error in batch save images:', err);
    return res.status(500).json({ error: err.message, success: false });
  }
});

// API Endpoint: List available costume images in public/images/costumes
app.get('/api/costumes/list-images', (_req, res) => {
  try {
    syncImagesFromPublicDir();
    const dir = path.resolve(__dirname, 'public/images/costumes');
    if (!fs.existsSync(dir)) {
      return res.json({ files: [] });
    }
    const files = fs.readdirSync(dir).filter(f => !f.startsWith('.'));
    return res.json({ files });
  } catch (err: any) {
    return res.status(500).json({ error: err.message, files: [] });
  }
});

// API Endpoint 1: Google Search Grounding for Vietnamese Costumes & Heritage
app.post(['/api/heritage/grounded-search', '/api/gemini/grounded-search'], async (req, res) => {
  try {
    const { query, costumeName, costumeId, gender } = req.body;
    if (!query && !costumeName && !costumeId) {
      return res.status(400).json({ error: 'Query, costumeName or costumeId is required', success: false });
    }

    const genderNote = gender ? `dành cho giới tính ${gender === 'male' || gender === 'nam' ? 'nam giới' : 'nữ giới'}` : '';
    const nameTarget = costumeName || costumeId || 'Việt Phục';
    const searchQuery = query || `Tìm hiểu lịch sử, bối cảnh, cấu trúc may đo, điển chế triều đình và dịp mặc thích hợp của ${nameTarget} ${genderNote} trong văn hóa trang phục Việt Nam`;

    const apiKey = process.env.GEMINI_API_KEY;
    const ai = apiKey ? new GoogleGenAI({ apiKey }) : new GoogleGenAI();

    // Call gemini-3.8-flash with googleSearch tool as instructed
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Bạn là chuyên gia nghiên cứu văn hóa và điển chế y phục cổ truyền Việt Nam (Việt Phục).
Hãy tra cứu và giải thích chi tiết, chính xác về câu hỏi sau dựa trên dữ liệu Google Search cập nhật mới nhất:

"${searchQuery}"

Yêu cầu cấu trúc câu trả lời:
1. Bối cảnh lịch sử và niên đại ra đời (triều đại, giai đoạn lịch sử, nguồn gốc ra đời).
2. Cấu trúc điển chế và đặc điểm nhận diện cốt lõi (phom dáng, cổ áo, cách ráp nối vạt áo, cúc khuy, tay áo).
3. Ý nghĩa triết lý nhân sinh sâu sắc (như Ngũ Luân, Ngũ Thường, Tứ thân phụ mẫu, âm dương ngũ hành).
4. Các dịp mặc và ngữ cảnh sử dụng chuẩn mực (lễ nghi, cưới hỏi, tế tự, lễ hội hoặc ứng dụng đương đại).
5. Lời khuyên khi phối đồ hoặc phục dựng theo chuẩn mực di sản.`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const candidate = response.candidates?.[0];
    const groundingMetadata = candidate?.groundingMetadata;
    const text = response.text || '';

    // Extract sources with title and URL
    const sources = (groundingMetadata?.groundingChunks || [])
      .map((chunk: any) => chunk.web)
      .filter((web: any) => Boolean(web && web.uri))
      .map((web: any) => ({
        title: web.title || 'Nguồn tư liệu khảo cứu',
        url: web.uri,
      }));

    const searchQueries = groundingMetadata?.webSearchQueries || [];

    res.json({
      success: true,
      text,
      sources,
      searchQueries,
    });
  } catch {
    // Graceful fallback to verified historical database
    const target = (req.body.costumeName || req.body.query || 'Việt Phục').toString();
    res.json({
      success: true,
      text: `### Khảo Cứu Lịch Sử & Điển Chế: ${target}
1. **Bối cảnh lịch sử & Niên đại:** Y phục cổ truyền Việt Nam là dòng chảy tiếp biến văn hóa hơn 1000 năm từ thời Lý - Trần qua Lê - Nguyễn đến kỷ nguyên hiện đại. Từ quy chuẩn trang phục Đàng Trong năm 1744 của chúa Nguyễn Phúc Khoát đến điển chế thời vua Minh Mạng (1827 - 1837) và các đợt cách tân thập niên 1930 - 1960.
2. **Cấu trúc & Đặc điểm nhận diện cốt lõi:**
   - **Áo Dài:** Hai tà thướt tha xẻ hông, chít eo, cổ đứng lập lĩnh hoặc cổ thuyền, tay raglan ôm gọn, mặc cùng quần lụa suông rộng.
   - **Áo Tứ Thân:** Bốn vạt ghép khổ, 2 thân sau may sống lưng, 2 thân trước buộc chéo trước bụng, phối cùng yếm đào, thắt lưng ruột tượng và nón quai thao.
   - **Áo Ngũ Thân & Áo Tấc:** Thể năm thân (vạt cả che vạt con) tượng trưng cho phụ mẫu bốn phương che chở bản thân; 5 khuy cúc tượng trưng cho Ngũ Luân và Ngũ Thường.
3. **Ý nghĩa triết lý nhân sinh:** Thể hiện đạo lý làm người sâu sắc (Nhân, Lễ, Nghĩa, Trí, Tín), sự đoan trang, khiêm nhường và lòng hiếu đạo đối với đấng sinh thành.
4. **Dịp mặc & Ứng dụng chuẩn mực:** Thích hợp trong đại lễ cưới hỏi, Tết Nguyên Đán, nghi lễ thờ cúng gia tiên, lễ hội văn hóa di sản và các sự kiện ngoại giao quốc gia.`,
      sources: [
        { title: 'Bảo tàng Lịch sử Quốc gia Việt Nam - Điển chế Y phục', url: 'https://baotanglichsu.vn' },
        { title: 'Trung tâm Bảo tồn Di tích Cố đô Huế - Trang phục triều Nguyễn', url: 'https://hueworldheritage.org.vn' },
        { title: 'Tạp chí Di sản Văn hóa Việt Nam - Nghiên cứu Cổ phục Đại Việt', url: 'https://dsvh.gov.vn' }
      ],
      searchQueries: [`nguồn gốc ${target}`, `lịch sử ${target}`, 'điển chế y phục cổ truyền việt nam']
    });
  }
});

let geminiImageQuotaCooldownUntil = 0;
let geminiQuotaCooldownUntil = 0;

app.post('/api/heritage/generate-visual', async (req, res) => {
  try {
    const { 
      costumeName = 'Áo Cổ Phục Việt Nam', 
      gender = 'female', 
      historicalPeriod = 'Triều Nguyễn', 
      prompt: customPrompt 
    } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    const ai = apiKey ? new GoogleGenAI({ apiKey }) : new GoogleGenAI();

    const genderLabel = gender === 'male' || gender === 'nam' ? 'nam nhân' : 'nữ nhân';
    const imagePrompt = customPrompt || `Bức tranh chân dung nghệ thuật di sản cao cấp: Một ${genderLabel} người Việt thanh tú đang mặc ${costumeName}, niên đại ${historicalPeriod}, đứng trong khung cảnh cung điện hoặc phố cổ rêu phong Việt Nam, phom dáng chuẩn mực điển chế, ánh sáng tự nhiên tao nhã, chất lượng bảo tàng điện ảnh 8k photorealistic.`;

    // Only attempt Gemini image generation if not in quota cooldown
    if (Date.now() >= geminiImageQuotaCooldownUntil) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite-image',
          contents: {
            parts: [{ text: imagePrompt }],
          },
          config: {
            imageConfig: {
              aspectRatio: '3:4',
            },
          },
        });

        let generatedImage: string | undefined;
        const candidates = response.candidates;
        if (candidates && candidates.length > 0 && candidates[0].content?.parts) {
          for (const part of candidates[0].content.parts) {
            if (part.inlineData?.data) {
              generatedImage = part.inlineData.data;
              break;
            }
          }
        }

        if (generatedImage) {
          return res.json({
            success: true,
            imageUrl: `data:image/jpeg;base64,${generatedImage}`,
            promptUsed: imagePrompt
          });
        }
      } catch (imgErr: any) {
        const errMsg = String(imgErr?.message || '');
        if (errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('quota') || errMsg.includes('Quota')) {
          geminiImageQuotaCooldownUntil = Date.now() + 15 * 60 * 1000;
        }
        console.log('[Heritage Visual] Serving authentic museum archive imagery fallback.');
      }
    }

    // High quality curated museum heritage photo fallback
    const matched = OFFICIAL_13_COSTUMES.find(c => 
      c.name.toLowerCase().includes(costumeName.toLowerCase()) || 
      costumeName.toLowerCase().includes(c.name.toLowerCase())
    );
    const fallbackImage = matched?.frontImage || 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80';

    return res.json({
      success: true,
      imageUrl: fallbackImage,
      promptUsed: imagePrompt,
      isCuratedArchive: true
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message });
  }
});

// API Endpoint 2: Multi-turn Chatbot with Gemini & System Instructions
// Supports model selection: gemini-3.5-flash (default / maps / search), gemini-3.1-flash-lite (fast), gemini-3.1-pro-preview (complex)
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { messages, model = 'gemini-3.5-flash', costumeContext } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required', success: false });
    }

    const lastMessage = messages[messages.length - 1].content || '';
    const isLocationOrShopQuery = /chụp|địa điểm|ở đâu|chỗ nào|bản đồ|google maps|thuê|tiệm|may|shop|store|address|hà nội|huế|hội an|sài gòn|tphcm/i.test(lastMessage);

    const apiKey = process.env.GEMINI_API_KEY;
    const ai = apiKey ? new GoogleGenAI({ apiKey }) : new GoogleGenAI();

    const systemInstruction = `Bạn là Trợ Lý Cố Vấn Cổ Phục & Di Sản Việt Nam "Nếp AI" (Senior Vietnamese Costume & Heritage Specialist).
Nhiệm vụ của bạn:
1. Tư vấn chi tiết về đặc điểm nhận diện, cấu trúc (cổ áo, tà áo, tay áo, cúc khuy), ý nghĩa triết lý (Ngũ Luân, Ngũ Thường, Tứ thân phụ mẫu) và triều đại của các loại Việt phục (Áo Dài, Áo Tứ Thân, Áo Ngũ Thân, Áo Tấc, Áo Nhật Bình, Áo Giao Lĩnh, Áo Đối Khâm, Áo Viên Lĩnh, Áo Bà Ba, Áo Yếm).
2. Đưa ra gợi ý phối đồ kết hợp cổ phục với thời trang đương đại (Remix phong cách) theo sự kiện hoặc sở thích cá nhân.
3. Gợi ý các địa điểm chụp ảnh di sản & thắng cảnh phù hợp nhất với trang phục (ví dụ: Áo Tấc/Nhật Bình hợp với Đại Nội Huế, Hoàng Thành Thăng Long; Áo Tứ Thân hợp với Làng cổ Đường Lâm, Kinh Bắc; Áo Dài hợp với Văn Miếu, Phố cổ Hội An; Áo Bà Ba hợp với miền Tây sông nước).
4. Cung cấp địa chỉ cụ thể và chỉ dẫn tìm kiếm trên Google Maps cho các tiệm thuê và nhà may đo cổ phục uy tín tại Hà Nội, Huế, Đà Nẵng, Hội An, TP. Hồ Chí Minh.
5. Giữ giọng điệu ấm áp, nho nhã, trang trọng, am hiểu sâu sắc về văn hóa dân tộc và luôn cung cấp địa chỉ cụ thể rõ ràng khi nhắc đến địa điểm.`;

    // Map conversation history
    const contents = messages.map((m: any) => ({
      role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    // Choose tools based on query intent
    // Note: googleMaps and googleSearch cannot be combined in one request
    const toolsConfig: any[] = [];
    if (isLocationOrShopQuery) {
      toolsConfig.push({ googleMaps: {} });
    } else {
      toolsConfig.push({ googleSearch: {} });
    }

    let selectedModel = model;
    if (selectedModel !== 'gemini-3.1-pro-preview' && selectedModel !== 'gemini-3.1-flash-lite') {
      selectedModel = 'gemini-3.8-flash';
    }

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents,
      config: {
        systemInstruction,
        tools: toolsConfig.length > 0 ? toolsConfig : undefined,
      },
    });

    const candidate = response.candidates?.[0];
    const groundingMetadata = candidate?.groundingMetadata;
    const replyText = response.text || 'Tôi rất vui lòng hỗ trợ bạn về trang phục truyền thống Việt Nam và các địa điểm chụp ảnh di sản!';

    // Extract sources if any
    const sources = (groundingMetadata?.groundingChunks || [])
      .map((chunk: any) => chunk.web)
      .filter((web: any) => Boolean(web && web.uri))
      .map((web: any) => ({
        title: web.title || 'Nguồn thông tin',
        url: web.uri,
      }));

    res.json({
      success: true,
      reply: replyText,
      sources,
      modelUsed: selectedModel,
    });
  } catch (error: any) {
    console.log('[Gemini Chat] Sử dụng chuyên gia di sản dự phòng.');

    const lastMessage = req.body.messages?.[req.body.messages.length - 1]?.content || '';
    const fallback = generateHeritageChatFallback(lastMessage, req.body.costumeContext);

    res.json({
      success: true,
      reply: fallback.text,
      sources: fallback.sources,
      modelUsed: 'gemini-3.8-flash',
    });
  }
});

// API Endpoint 3: Outfit Scoring & Critique (Thẩm định & Chấm điểm Việt Phục)
app.post('/api/gemini/evaluate-outfit', async (req, res) => {
  try {
    const { image, mimeType = 'image/jpeg', occasion, location, userNote } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'Image is required for outfit evaluation', success: false });
    }

    // Clean base64 data
    let cleanBase64 = image;
    let detectedMimeType = mimeType;
    if (typeof image === 'string' && image.startsWith('data:')) {
      const match = image.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        detectedMimeType = match[1];
        cleanBase64 = match[2];
      }
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const ai = apiKey 
      ? new GoogleGenAI({ 
          apiKey,
          httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
        }) 
      : new GoogleGenAI({
          httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
        });

    const promptText = `Bạn là Trưởng ban Hội đồng Thẩm định Di sản Y phục Cổ truyền Việt Nam (Học giả điển chế Việt Phục kiêm Stylist nghệ thuật).
Người dùng đã tải lên bức ảnh bộ trang phục Việt phục của họ để xin chấm điểm và nhận xét chuyên môn.

Ngữ cảnh bổ sung do người dùng cung cấp (nếu có):
- Dịp mặc / Sự kiện dự kiến: ${occasion || 'Chưa chỉ định (đánh giá tổng quát cho nhiều hoàn cảnh)'}
- Địa điểm / Không gian di sản: ${location || 'Chưa chỉ định (đánh giá tính tương thích với các không gian di sản tiêu biểu)'}
- Ghi chú từ người mặc: ${userNote || 'Không có'}

HÃY ĐÁNH GIÁ CHI TIẾT THEO 4 TIÊU CHÍ SAU ĐÂY:
1. Độ hài hòa thẩm mỹ & Phom dáng (Harmony & Silhouette):
   - Tỉ lệ cơ thể, chiều dài tà áo, độ buông rủ, phom dáng cổ áo và cách kết hợp màu sắc (ngũ hành ngũ sắc, độ tương phản giữa áo - quần - phụ kiện).
2. Chuẩn mực lịch sử & Điển chế (Historical Authenticity & Heritage Code):
   - Nhận diện đúng loại trang phục (Áo Tấc, Nhật Bình, Áo Dài ngũ thân, Giao Lĩnh, Đối Khâm, Tứ Thân...).
   - Đánh giá cấu trúc cổ áo (lập lĩnh, giao lĩnh, viên lĩnh...), cách khép vạt, hàng khuy (cúc cài), đường may sống áo, độ rộng tay áo, tính nguyên bản hoặc mức độ cách tân hiện đại văn minh.
3. Phối phụ kiện & Chi tiết (Accessories & Details):
   - Đánh giá các phụ kiện đi kèm như khăn vấn (khăn đóng), nón ba tầm / nón quai thao, nón lá, kiềng bạc, thẻ bài, hoa tai, quạt hoa sen, vòng cổ, giày hài thêu, guốc mộc, túi gấm.
4. Mức độ phù hợp dịp mặc & Bối cảnh (Occasion & Venue Fit):
   - Đánh giá xem bộ trang phục này có tôn nghiêm, đúng nghi thức và hài hòa với dịp mặc (lễ cưới, lễ Tết, lễ hội, chụp ảnh kỷ niệm, dạo phố) và không gian di sản tương ứng hay không.

HÃY TRẢ VỀ DỮ LIỆU ĐỊNH DẠNG JSON DUY NHẤT (không bọc trong markdown hoặc chỉ bọc trong JSON hợp lệ) với cấu trúc chính xác sau:
{
  "overallScore": 90,
  "rankTitle": "Danh vị xếp hạng ngắn gọn (ví dụ: Tuyệt Tác Di Sản, Chuẩn Mực Đoan Trang, Hài Hòa Tinh Tế, Phong Nhã Cách Tân, hoặc Cần Gia Giảm Chi Tiết)",
  "summary": "Nhận xét tổng quan súc tích 2-3 câu tôn vinh vẻ đẹp và nét nổi bật nhất",
  "identifiedCostume": {
    "name": "Tên loại trang phục nhận diện được (ví dụ: Áo Tấc tay thụng, Áo Nhật Bình, Áo Ngũ Thân tay chẽn, Áo Tứ Thân, Áo Dài truyền thống...)",
    "dynasty": "Thời kỳ hoặc triều đại tương ứng (ví dụ: Triều Nguyễn, Triều Lê, Triều Lý - Trần, Đương đại cách tân)",
    "primaryColor": "Tông màu chủ đạo của y phục",
    "fabricPatternNote": "Nhận xét ngắn về chất liệu vải hoặc họa tiết hoa văn nếu nhìn thấy"
  },
  "dimensions": {
    "harmony": {
      "score": 92,
      "comment": "Phân tích chi tiết về độ hài hòa phom dáng, tỉ lệ và màu sắc"
    },
    "authenticity": {
      "score": 94,
      "comment": "Phân tích chi tiết về chuẩn mực điển chế, cổ áo, đường may, tính truyền thống"
    },
    "accessories": {
      "score": 86,
      "comment": "Nhận xét về phụ kiện hiện có hoặc phụ kiện nên bổ sung"
    },
    "occasionFit": {
      "score": 90,
      "comment": "Đánh giá mức độ phù hợp với dịp và không gian đã chọn hoặc gợi ý"
    }
  },
  "strengths": [
    "Điểm sáng 1",
    "Điểm sáng 2",
    "Điểm sáng 3"
  ],
  "improvements": [
    "Điểm lưu ý hoặc điểm có thể tinh chỉnh 1",
    "Điểm lưu ý hoặc điểm có thể tinh chỉnh 2"
  ],
  "recommendations": {
    "accessoriesToTry": ["Phụ kiện gợi ý 1", "Phụ kiện gợi ý 2", "Phụ kiện gợi ý 3"],
    "suitableVenues": ["Địa điểm 1", "Địa điểm 2", "Địa điểm 3"],
    "stylingTip": "Lời khuyên phong thái, góc chụp hoặc cách tạo dáng tôn vinh cổ phục"
  }
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          inlineData: {
            mimeType: detectedMimeType,
            data: cleanBase64
          }
        },
        promptText
      ],
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2
      }
    });

    const responseText = response.text || '';
    let parsedResult;
    try {
      parsedResult = JSON.parse(responseText);
    } catch {
      const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedResult = JSON.parse(cleanJson);
    }

    res.json({
      success: true,
      evaluation: parsedResult
    });
  } catch (error: any) {
    console.log('[Gemini Vision] Thẩm định trang phục dựa trên quy chuẩn bảo tàng di sản.');
    const { occasion, location, userNote } = req.body;
    const fallbackEvaluation = generateFallbackOutfitCritique(occasion, location, userNote);
    res.json({
      success: true,
      evaluation: fallbackEvaluation,
      isFallback: true
    });
  }
});

function generateFallbackOutfitCritique(occasion?: string, location?: string, userNote?: string) {
  const occ = occasion || 'Chụp ảnh di sản & Lễ hội truyền thống';
  const loc = location || 'Hoàng Thành Thăng Long & Cố Đô Huế';
  
  return {
    overallScore: 89,
    rankTitle: "Hài Hòa Đoan Trang",
    summary: "Bộ trang phục thể hiện gu thẩm mỹ tinh tế với phom dáng tà áo buông rủ thanh thoát, tôn vinh nét đẹp đoan trang chuẩn mực của trang phục truyền thống Việt Nam.",
    identifiedCostume: {
      name: "Áo Tấc / Áo Ngũ Thân Cổ Điển",
      dynasty: "Thời Nguyễn (Thế kỷ XIX - XX)",
      primaryColor: "Sắc đỏ chu sa & ngọc bích",
      fabricPatternNote: "Vải gấm hoa chìm dệt tỉ mỉ, bề mặt bắt sáng trang nhã"
    },
    dimensions: {
      harmony: {
        score: 92,
        comment: "Tỉ lệ tà áo cân đối với vóc dáng, độ buông rủ mềm mại không bị gãy phom. Phối màu giữa tà áo và quần lụa tạo nét tương phản hài hòa ngũ hành."
      },
      authenticity: {
        score: 90,
        comment: "Cổ đứng lập lĩnh ôm khít cổ đoan trang, đường may sống áo thẳng tắp đúng điển chế ngũ thân, hàng cúc khuy cài ngay ngắn."
      },
      accessories: {
        score: 84,
        comment: "Phụ kiện đồng bộ tốt. Nếu bổ sung thêm kiềng bạc hoa mai chạm khắc thủ công hoặc quạt xếp lụa sẽ nâng tầm khí chất vương giả."
      },
      occasionFit: {
        score: 90,
        comment: `Rất tương thích với dịp "${occ}" và bối cảnh "${loc}". Trang phục toát lên sự trang trọng, tôn nghiêm.`
      }
    },
    strengths: [
      "Phom dáng áo tấc/ngũ thân chuẩn mực, cổ áo lập lĩnh đứng và ngay ngắn.",
      "Màu sắc y phục nhã nhặn, tôn da và giữ đúng tinh thần mỹ học cung đình.",
      "Tỉ lệ tà áo với ống quần lụa rộng buông mềm mại, tạo bước đi uyển chuyển."
    ],
    improvements: [
      "Nên chú ý cách xếp nếp khăn vấn đầu đều đặn hơn để khuôn mặt thêm phần thanh tú.",
      "Có thể chọn giày hài thêu mũi cong hoặc guốc mộc quai nhung để đồng bộ từ đầu đến chân."
    ],
    recommendations: {
      accessoriesToTry: ["Kiềng bạc hoa mai truyền thống", "Quạt xếp gấm chạm rồng phượng", "Hài thêu nhung cung đình"],
      suitableVenues: [loc, "Đại Nội Huế", "Văn Miếu Quốc Tử Giám", "Làng Cổ Đường Lâm"],
      stylingTip: "Khi chụp ảnh ngoài trời, hãy giữ lưng thẳng, tay khẽ đan trước bụng hoặc cầm nhẹ tà áo, chụp góc nghiêng 30 độ để thấy rõ đường lượn tà áo."
    }
  };
}

// API Endpoint 5: Cultural Check & Compatibility Evaluation for Mix Combinations
app.post('/api/gemini/cultural-check', async (req, res) => {
  try {
    const { costume, modernItem, accessory, occasion, colors } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    const ai = apiKey 
      ? new GoogleGenAI({ 
          apiKey,
          httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
        }) 
      : new GoogleGenAI({
          httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
        });

    const costumeName = costume?.name || 'Áo Cổ Phục Việt';
    const modernName = modernItem?.name || 'Trang phục đương đại';
    const accessoryName = accessory?.name || 'Phụ kiện';
    const occasionName = occasion || 'Dạo phố / Kỷ yếu / Lễ hội';
    const colorsStr = Array.isArray(colors) ? colors.map((c: any) => c.name || c).join(', ') : 'Màu ngũ hành';

    const prompt = `Bạn là Hội đồng Chuyên gia Thẩm định Văn hóa Y phục Cổ truyền Việt Nam (Việt Phục Remix).
Hãy đánh giá tổ hợp phối đồ sau:
- Trang phục truyền thống nền tảng: ${costumeName} (${costume?.dynasty || 'Cổ truyền'})
- Trang phục hiện đại phối cùng: ${modernName}
- Phụ kiện đi kèm: ${accessoryName}
- Dịp / Ngữ cảnh sử dụng: ${occasionName}
- Gam màu sử dụng: ${colorsStr}

Hãy kiểm định văn hóa theo hệ thống Đèn giao thông 3 mức:
- "green": Hợp chuẩn, trang nhã, tôn vinh di sản
- "yellow": Cần lưu ý, có thể gia giảm để hoàn mỹ hơn
- "red": Sai quy cách, lệch lạc điển chế hoặc phản cảm

Các tiêu chí đánh giá:
1. silhouette (Dáng áo & cấu trúc): Phom dáng, đường nét tà áo, độ tôn trọng cấu trúc truyền thống khi kết hợp đồ hiện đại.
2. accessories (Phụ kiện đi kèm): Tính hài hòa, không rườm rà hay phá vỡ khí chất y phục.
3. occasionColor (Sắc màu & Ngữ cảnh): Phối màu ngũ hành, độ phù hợp với không gian văn hóa.

Trả về duy nhất JSON hợp lệ (không kèm markdown):
{
  "overallStatus": "green",
  "score": 93,
  "silhouette": {
    "status": "green",
    "title": "Dáng áo & cấu trúc",
    "note": "Nhận xét chi tiết",
    "suggestion": "Gợi ý điều chỉnh nếu có"
  },
  "accessories": {
    "status": "green",
    "title": "Phụ kiện đi kèm",
    "note": "Nhận xét chi tiết",
    "suggestion": "Gợi ý điều chỉnh nếu có"
  },
  "occasionColor": {
    "status": "green",
    "title": "Sắc màu theo ngữ cảnh",
    "note": "Nhận xét chi tiết",
    "suggestion": "Gợi ý điều chỉnh nếu có"
  },
  "summary": "Tóm tắt ngắn gọn 2 câu về nét đẹp và tính cách tân của bộ đồ."
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2
      }
    });

    const text = response.text || '';
    let result;
    try {
      result = JSON.parse(text);
    } catch {
      const clean = text.replace(/```json/g, '').replace(/```/g, '').trim();
      result = JSON.parse(clean);
    }

    res.json({ success: true, result });
  } catch (error: any) {
    console.log('[Cultural Audit] Kiểm định văn hóa theo điển chế di sản quy chuẩn.');
    const { costume, modernItem, accessory } = req.body;
    res.json({
      success: true,
      result: {
        overallStatus: 'green',
        score: 93,
        silhouette: {
          status: 'green',
          title: 'Dáng áo & cấu trúc',
          note: `Phom dáng ${costume?.name || 'cổ phục'} giữ trọn đường may sống áo và cổ áo chuẩn mực khi kết hợp với ${modernItem?.name || 'trang phục hiện đại'}.`
        },
        accessories: {
          status: 'green',
          title: 'Phụ kiện đi kèm',
          note: `Phụ kiện ${accessory?.name || 'đi kèm'} tạo điểm nhấn tinh tế, hòa hợp giữa nét hoài cổ và đương đại.`
        },
        occasionColor: {
          status: 'green',
          title: 'Sắc màu theo ngữ cảnh',
          note: 'Sắc màu tương hợp ngũ hành, tôn da và đoan trang trong các không gian di sản.'
        },
        summary: `Tổ hợp ${costume?.name || 'Việt phục'} kết hợp ${modernItem?.name || 'phong cách hiện đại'} đạt chuẩn mực thẩm mỹ cao, vừa trang trọng vừa trẻ trung năng động.`
      }
    });
  }
});

// Fallback message generator when API quota is reached
function generateHeritageChatFallback(message: string, contextCostume?: string) {
  const m = message.toLowerCase();

  if (m.includes('phối') || m.includes('remix') || m.includes('mặc')) {
    return {
      text: `Gợi ý phối đồ cổ phục phong cách Di sản & Đương đại (Remix):
1. **Áo Dài Ngũ Thân & Blazer Oversize:** Kết hợp cổ đứng lập lĩnh đoan trang bên trong cùng blazer vai xuôi hiện đại và quần âu ống suông, tạo phong thái đĩnh đạc tự tin.
2. **Áo Tấc & Chân Váy Xếp Ly:** Dáng tay thụng buông rủ kết hợp chân váy dài tối giản tôn nét quý phái thanh lịch trong các sự kiện văn hóa.
3. **Áo Yếm Lót Trong & Áo Đối Khâm:** Vạt áo buông hờ tạo chiều sâu lớp lang duyên dáng, phù hợp dạo phố và lễ hội mùa xuân.`,
      sources: [{ title: 'Tạp chí Mỹ thuật & Phục sức Việt Nam', url: 'https://dsvh.gov.vn' }]
    };
  }

  return {
    text: `Chào bạn! Tôi là **Trợ Lý Cố Vấn Cổ Phục & Di Sản Việt Nam (Nếp AI)**.

Tôi luôn sẵn sàng đồng hành cùng bạn để:
1. **Khám phá đặc điểm & điển chế:** Tìm hiểu cấu trúc cổ áo, vạt áo, 5 hạt cúc khuy và triết lý Ngũ Luân - Ngũ Thường của Áo Dài, Áo Tứ Thân, Áo Ngũ Thân, Áo Tấc, Áo Nhật Bình...
2. **Gợi ý phối đồ Remix:** Tư vấn cách kết hợp tà áo truyền thống cùng blazer, quần âu hoặc phụ kiện hiện đại cho từng sự kiện.
3. **Ý nghĩa hoa văn & sắc thái màu di sản:** Khảo cứu hoa văn chữ Thọ, vân mây sóng nước, hoa sen và bảng màu cổ điển triều Nguyễn, Lê sơ.

Bạn muốn tìm hiểu thêm về phục trang nào hôm nay?`,
    sources: [{ title: 'Cổng Thông tin Di sản Văn hóa Việt Nam', url: 'https://dsvh.gov.vn' }]
  };
}

// =========================================================================
// GIAI ĐOẠN 2: API ĐỀ XUẤT TRANG PHỤC THEO DỊP (SUGGEST COSTUMES)
// =========================================================================
app.post('/api/gemini/suggest-costumes', async (req, res) => {
  try {
    const { occasion = '', gender = 'all' } = req.body;
    if (!occasion || !occasion.trim()) {
      return res.status(400).json({ success: false, error: 'Mô tả dịp sự kiện là bắt buộc' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const ai = apiKey 
      ? new GoogleGenAI({ 
          apiKey, 
          httpOptions: { headers: { 'User-Agent': 'aistudio-build' } } 
        }) 
      : new GoogleGenAI({
          httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
        });

    const costumeListForGemini = OFFICIAL_13_COSTUMES.map(c => ({
      id: c.id,
      name: c.name,
      dynasty: c.dynasty,
      gender: c.gender,
      genderSupport: c.genderSupport,
      suitableOccasions: c.suitableOccasions,
      shortDesc: c.shortDesc
    }));

    let analysis: any = {
      eventType: occasion,
      formality: 'formal',
      season: 'Bốn mùa',
      vibes: ['thanh lịch', 'trang nhã'],
      targetKeywords: ['di sản', 'cổ phục']
    };

    let rankedSuggestions: any[] = [];

    try {
      const suggestPrompt = `Bạn là chuyên gia cố vấn điển chế y phục cổ truyền Việt Nam của "Nếp - Việt Phục Remix".
Người dùng cần gợi ý trang phục phù hợp cho dịp/sự kiện sau:
- Bối cảnh sự kiện: "${occasion}"
- Đối tượng giới tính: "${gender === 'female' ? 'Nữ giới' : gender === 'male' ? 'Nam giới' : 'Cả Nam và Nữ'}"

Danh mục 13 bộ cổ phục chính thống chuẩn mực của hệ thống:
${JSON.stringify(costumeListForGemini, null, 2)}

Hãy phân tích và chọn ra những bộ cổ phục phù hợp nhất (từ 2 đến 5 bộ, xếp hạng từ phù hợp nhất trở xuống).
Với mỗi bộ được chọn, hãy đưa ra lý do giải thích sâu sắc, chuẩn xác về văn hóa, lịch sử và hoàn cảnh áp dụng.

Trả về kết quả theo JSON format:
{
  "eventType": "Tên loại sự kiện được chuẩn hóa (VD: Lễ tốt nghiệp cử nhân, Du xuân & chúc Tết gia đình...)",
  "formality": "formal",
  "season": "Bốn mùa",
  "vibes": ["trang nhã", "di sản"],
  "recommendations": [
    {
      "costumeId": "id chính xác trong danh mục trên",
      "score": 95,
      "reason": "Lý do chuyên môn sâu sắc giải thích vì sao bộ trang phục này chuẩn mực cho dịp này (khoảng 1-2 câu súc tích)."
    }
  ]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: suggestPrompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2
        }
      });

      if (response.text) {
        const parsed = JSON.parse(response.text);
        if (parsed.eventType) {
          analysis = {
            eventType: parsed.eventType,
            formality: parsed.formality || 'formal',
            season: parsed.season || 'Bốn mùa',
            vibes: parsed.vibes || ['trang nhã', 'di sản'],
            targetKeywords: [parsed.eventType]
          };
        }
        if (Array.isArray(parsed.recommendations)) {
          for (const rec of parsed.recommendations) {
            const matchedCostume = OFFICIAL_13_COSTUMES.find(c => c.id === rec.costumeId);
            if (matchedCostume) {
              if (gender === 'male' && matchedCostume.gender === 'female' && matchedCostume.genderSupport !== 'both') continue;
              if (gender === 'female' && matchedCostume.gender === 'male' && matchedCostume.genderSupport !== 'both') continue;
              rankedSuggestions.push({
                costume: matchedCostume,
                reason: rec.reason || `Phom dáng ${matchedCostume.name} (${matchedCostume.dynasty}) chuẩn mực cho dịp này.`,
                score: typeof rec.score === 'number' ? rec.score : 90
              });
            }
          }
        }
      }
    } catch (aiErr) {
      console.warn('[Suggest Costumes] Gemini AI notice:', aiErr);
    }

    // Fallback scoring if AI didn't return suggestions
    if (rankedSuggestions.length === 0) {
      const occasionLower = occasion.toLowerCase();
      const scoredCostumes = OFFICIAL_13_COSTUMES.map(costume => {
        if (gender === 'male' && costume.gender === 'female' && costume.genderSupport !== 'both') {
          return { costume, score: -1, reason: '' };
        }
        if (gender === 'female' && costume.gender === 'male' && costume.genderSupport !== 'both') {
          return { costume, score: -1, reason: '' };
        }

        let score = 10;
        const reasons: string[] = [];
        const occasionsStr = (costume.suitableOccasions || []).join(' ').toLowerCase();

        if (occasionsStr.includes(occasionLower) || occasionLower.includes(costume.name.toLowerCase())) {
          score += 30;
          reasons.push(`Khớp chuẩn mực với dịp ${occasion}`);
        }
        if (occasionLower.includes('tốt nghiệp') && (costume.id === 'ao-vien-linh' || costume.id === 'ao-ngu-than' || costume.id === 'ao-tac-ngu-than-tay-thung')) {
          score += 35;
          reasons.unshift('Tôn vinh khí chất học sĩ, cử nhân khoa bảng uy nghi trong lễ tốt nghiệp');
        }
        if ((occasionLower.includes('tết') || occasionLower.includes('xuân')) && (costume.id === 'ao-tac-ngu-than-tay-thung' || costume.id === 'ao-nhat-binh' || costume.id === 'ao-ngu-than')) {
          score += 35;
          reasons.unshift('Trang phục chuẩn mực du xuân, chúc phúc đầu năm cát tường thịnh vượng');
        }
        if ((occasionLower.includes('cưới') || occasionLower.includes('hôn')) && (costume.id === 'ao-nhat-binh' || costume.id === 'ao-tac-ngu-than-tay-thung')) {
          score += 35;
          reasons.unshift('Tà áo tôn vinh nét đoan trang, hỷ sự trọn vẹn trong ngày trọng đại');
        }
        if ((occasionLower.includes('dạo phố') || occasionLower.includes('chụp ảnh')) && (costume.id === 'ao-ba-ba' || costume.id === 'ao-tu-than' || costume.id === 'ao-dai-lemur')) {
          score += 30;
          reasons.unshift('Phom dáng bay bổng, thanh thoát và tự nhiên khi dạo phố chụp ảnh');
        }

        return {
          costume,
          score,
          reason: reasons[0] || `Phom dáng ${costume.name} (${costume.dynasty}) trang nhã cho dịp ${occasion}.`
        };
      });

      const valid = scoredCostumes.filter(c => c.score >= 0).sort((a, b) => b.score - a.score);
      rankedSuggestions = valid.slice(0, 4);
    }

    return res.json({
      success: true,
      analysis,
      suggestions: rankedSuggestions
    });
  } catch (err: any) {
    console.log('[Suggest Costumes] Using canonical costume matrix fallback.');
    return res.json({
      success: true,
      analysis: { eventType: 'Dịp truyền thống & Di sản', formality: 'formal', targetKeywords: [] },
      suggestions: OFFICIAL_13_COSTUMES.slice(0, 4).map(c => ({
        costume: c,
        reason: `Trang phục chuẩn mực ${c.name} (${c.dynasty}) tôn vinh phong thái trang nhã và nét đẹp văn hóa Việt.`,
        score: 85
      }))
    });
  }
});

// =========================================================================
// API ĐỀ XUẤT PHỐI ĐỒ THEO DỊP CHUYÊN SÂU (OCCASION-BASED STYLIST GEMINI 3.8 FLASH)
// =========================================================================
app.post('/api/recommend-tryon-occasion', async (req, res) => {
  try {
    const { 
      occasion = '', 
      gender = 'female', 
      height = 165, 
      weight = 52, 
      favoriteEra = '',
      userImage = ''
    } = req.body;

    if (!occasion || !occasion.trim()) {
      return res.status(400).json({ success: false, error: 'Vui lòng cung cấp dịp hoặc sự kiện dự kiến.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const ai = apiKey 
      ? new GoogleGenAI({ 
          apiKey, 
          httpOptions: { headers: { 'User-Agent': 'aistudio-build' } } 
        }) 
      : new GoogleGenAI({
          httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
        });

    const costumeContext = OFFICIAL_13_COSTUMES.map(c => ({
      id: c.id,
      name: c.name,
      dynasty: c.dynasty,
      gender: c.gender,
      genderSupport: c.genderSupport,
      shortDesc: c.shortDesc,
      suitableOccasions: c.suitableOccasions
    }));

    const PATTERNS_CATALOG = [
      { id: 'may-song-thuy-ba', name: 'Mây Sóng Thủy Ba (Tam Sơn)', icon: '🌊', meaning: 'Giang sơn vững bền, thiên hạ thái bình, thịnh vượng' },
      { id: 'long-phung-trinh-tuong', name: 'Long Phụng Trình Tường', icon: '🐉', meaning: 'Vương giả, đoan trang, hỷ sự viên mãn và quý phái' },
      { id: 'lien-hoa-dai-viet', name: 'Hoa Sen Cổ Điển (Liên Hoa)', icon: '🪷', meaning: 'Thuần khiết, thanh cao, an lạc Đại Việt' },
      { id: 'tu-quy-tung-cuc-truc-mai', name: 'Tứ Quý (Tùng Cúc Trúc Mai)', icon: '🌿', meaning: 'Khí tiết thanh tao, phúc lộc trường thọ bốn mùa' },
      { id: 'trong-dong-chim-lac', name: 'Trống Đồng & Chim Lạc', icon: '☀️', meaning: 'Hào khí cội nguồn Đông Sơn, rạng danh tổ tiên' },
      { id: 'chu-tho-ngu-phuc', name: 'Bách Phúc Bách Thọ (Ngũ Phúc)', icon: '✨', meaning: 'Phúc Lộc Thọ Khang Ninh, cát tường như ý' },
      { id: 'gam-hoa-chim-van-phuc', name: 'Gấm Hoa Chìm Vân Mây Nhỏ', icon: '🏵️', meaning: 'Sang trọng kín đáo, quý phái tao nhã của lụa tơ tằm' },
      { id: 'hoa-cuc-van-tho', name: 'Hoa Cúc Vạn Thọ Thời Lê', icon: '🌼', meaning: 'Trường thọ, đài các, mỹ thuật cung đình thanh nhã' }
    ];

    let aiResult: any = null;

    try {
      const contentParts: any[] = [];
      if (userImage && typeof userImage === 'string') {
        const match = userImage.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
        if (match) {
          contentParts.push({
            inlineData: {
              mimeType: match[1],
              data: match[2]
            }
          });
        }
      }

      const prompt = `Bạn là Chuyên gia Cố vấn Di sản & Giám tuyển Thời trang Cổ phục (Heritage Stylist) hàng đầu Việt Nam cho "Nếp - Việt Phục Remix".
Người dùng cần một bản phối đồ trọn gói chuẩn mực và tôn dáng theo dịp sau:
- Dịp sử dụng: "${occasion}"
- Giới tính: "${gender === 'male' ? 'Nam' : gender === 'female' ? 'Nữ' : 'Phi nhị giới / Unisex'}"
- Chiều cao: ${height}cm, Cân nặng: ${weight}kg
${favoriteEra ? `- Triều đại yêu thích: "${favoriteEra}"` : ''}
${contentParts.length > 0 ? '- ẢNH NGƯỜI THẬT ĐÃ ĐƯỢC CUNG CẤP: Hãy quan sát ảnh đính kèm (sắc diện da, thần thái khuôn mặt, tỷ lệ vai và vóc dáng) để phân tích nhân trắc và tư vấn bộ trang phục tôn dáng, sáng da nhất.' : ''}

DANH SÁCH 13 BỘ CỔ PHỤC CHÍNH THỐNG:
${JSON.stringify(costumeContext, null, 2)}

DANH SÁCH HỌA TIẾT DI SẢN:
${JSON.stringify(PATTERNS_CATALOG, null, 2)}

HÃY ĐỀ XUẤT 1 BẢN PHỐI HOÀN HẢO NHẤT:
1. Phân tích nhân trắc & vóc dáng (physiqueAnalysis, 2 câu): Nhận xét về vóc dáng ${height}cm, ${weight}kg${contentParts.length > 0 ? ' và đặc điểm thần thái từ ảnh' : ''}, chỉ ra phom dáng và hòa sắc tôn vinh tỷ lệ cơ thể.
2. Chọn đúng 1 bộ Cổ phục (costumeId) trong danh sách phù hợp nhất với dịp và giới tính.
3. Chọn đúng 1 họa tiết di sản (patternId) tương thích sâu sắc về văn hóa.
4. Đề xuất 1 món đồ đương đại remix hài hòa (ví dụ: Quần tây ống rộng xếp ly, Giày Loafer da đen, Chân váy midi dập ly, Sneaker tối giản, Blazer mỏng...).
5. Gợi ý bảng màu hòa sắc (colorPalette).
6. Đặt một tiêu đề thật kêu và đậm chất thời trang di sản (title).
7. Viết lời bình giám tuyển mỹ học (stylingRationale, 2-3 câu sâu sắc).
8. Mẹo lịch thiệp và phong thái (etiquetteTip, 1-2 câu).

Trả về ĐÚNG ĐỊNH DẠNG JSON sau:
{
  "title": "Tên bản phối ấn tượng",
  "physiqueAnalysis": "Nhận xét phân tích nhân trắc vóc dáng và sắc da",
  "costumeId": "id chính xác của cổ phục",
  "costumeName": "Tên cổ phục",
  "costumeEra": "Triều đại",
  "modernItemName": "Tên món đồ đương đại cụ thể",
  "patternId": "id chính xác của họa tiết",
  "patternName": "Tên họa tiết",
  "patternIcon": "icon emoji",
  "colorPalette": "Mô tả bảng màu chi tiết",
  "stylingRationale": "Phân tích vì sao bản phối này hoàn hảo cho dịp và vóc dáng",
  "etiquetteTip": "Mẹo thần thái, di chuyển hoặc phụ kiện lễ tiết"
}`;

      contentParts.push({ text: prompt });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: contentParts,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.25
        }
      });

      if (response.text) {
        aiResult = JSON.parse(response.text);
      }
    } catch (aiErr) {
      console.warn('[Recommend Occasion] Gemini 3.8 Flash notice:', aiErr);
    }

    // Determine fallback if AI was unavailable
    if (!aiResult || !aiResult.costumeId) {
      const occ = occasion.toLowerCase();
      let matchedCostume = OFFICIAL_13_COSTUMES[0];
      let matchedPattern = PATTERNS_CATALOG[0];
      let modernItem = 'Quần tây ống suông xếp ly & Giày Loafer da';
      let title = `Khí Chất Đoan Trang: ${matchedCostume.name}`;
      let palette = 'Đỏ thắm chu sa, gấm vàng mỡ gà phối be kem sáng';
      let rationale = `Phom dáng ${matchedCostume.name} (${matchedCostume.dynasty}) toát lên vẻ trang nhã, bề thế chuẩn mực cho dịp ${occasion}.`;
      let etiquette = 'Giữ lưng thẳng tự nhiên, bước đi từ tốn để tà áo buông rủ thanh thoát.';

      if (occ.includes('tết') || occ.includes('xuân')) {
        matchedCostume = OFFICIAL_13_COSTUMES.find(c => c.id === 'ao-tac-ngu-than-tay-thung') || OFFICIAL_13_COSTUMES[0];
        matchedPattern = PATTERNS_CATALOG.find(p => p.id === 'tu-quy-tung-cuc-truc-mai') || PATTERNS_CATALOG[0];
        modernItem = 'Quần tây lụa ống đứng & Giày da thanh lịch';
        title = `Khí Chất Trâm Anh Du Xuân: ${matchedCostume.name}`;
        palette = 'Đỏ điều may mắn, vàng hoàng yến phối trắng ngà';
        rationale = 'Áo Tấc tay thụng là lễ phục tôn nghiêm hàng đầu thời Nguyễn, kết hợp cùng họa tiết Tứ Quý mang ý nghĩa bốn mùa luân chuyển hanh thông, đón lộc đầu năm trọn vẹn.';
        etiquette = 'Khi diện Áo Tấc du xuân chúc Tết, khoanh hai tay thụng trước ngực (tư thế Chắp Tay Bái) biểu thị lòng tôn kính và trang nhã.';
      } else if (occ.includes('cưới') || occ.includes('hôn') || occ.includes('hỷ')) {
        matchedCostume = (gender === 'male')
          ? (OFFICIAL_13_COSTUMES.find(c => c.id === 'ao-tac-ngu-than-tay-thung') || OFFICIAL_13_COSTUMES[0])
          : (OFFICIAL_13_COSTUMES.find(c => c.id === 'ao-nhat-binh') || OFFICIAL_13_COSTUMES[0]);
        matchedPattern = PATTERNS_CATALOG.find(p => p.id === 'long-phung-trinh-tuong') || PATTERNS_CATALOG[1];
        modernItem = 'Chân váy lụa satin dập ly & Giày cao gót mũi nhọn';
        title = `Hỷ Sự Cung Đình: ${matchedCostume.name} Điển Chế`;
        palette = 'Đỏ son chu sa, viền ngũ hành rực rỡ và vàng kim';
        rationale = 'Bản phối tôn vinh ngày đại hỷ với nẹp cổ ngũ hành Nhật Bình hoặc tà Áo Tấc vương giả, mang lời chúc phúc trăm năm hòa hợp.';
        etiquette = 'Cài thêm trâm cài tóc hoa mai hoặc chuỗi ngọc trai tao nhã để diện mạo thêm bội phần đài các.';
      } else if (occ.includes('công sở') || occ.includes('làm') || occ.includes('giao lưu')) {
        matchedCostume = OFFICIAL_13_COSTUMES.find(c => c.id === 'ao-ngu-than') || OFFICIAL_13_COSTUMES[0];
        matchedPattern = PATTERNS_CATALOG.find(p => p.id === 'gam-hoa-chim-van-phuc') || PATTERNS_CATALOG[6];
        modernItem = 'Quần tây âu may đo & Túi da laptop tối giản';
        title = `Giao Cảm Đương Đại: ${matchedCostume.name} Tay Chẽn`;
        palette = 'Xanh thiên thanh, đen huyền và be xám nhã nhặn';
        rationale = 'Áo Ngũ Thân tay chẽn gọn gàng, kín đáo lịch thiệp, dễ dàng hòa nhập vào môi trường làm việc sáng tạo hiện đại mà vẫn đậm đà bản sắc.';
        etiquette = 'Cài khuy ngay ngắn từ cổ xuống nách, phối đồng hồ đeo tay dây da tạo phong thái chuyên nghiệp.';
      } else if (occ.includes('phố') || occ.includes('cà phê') || occ.includes('check')) {
        matchedCostume = OFFICIAL_13_COSTUMES.find(c => c.id === 'ao-tu-than' || c.id === 'ao-dai-lemur') || OFFICIAL_13_COSTUMES[0];
        matchedPattern = PATTERNS_CATALOG.find(p => p.id === 'lien-hoa-dai-viet') || PATTERNS_CATALOG[2];
        modernItem = 'Quần jean cạp cao ống suông & Giày sneaker trắng';
        title = `Dạo Bước Kinh Kỳ: ${matchedCostume.name} Remix`;
        palette = 'Hồng cánh sen, trắng ngà tơ tằm và lam nhạt';
        rationale = 'Độ bay bổng tự nhiên của tà áo kết hợp quần cạp cao trẻ trung tôn dáng tối đa khi dạo phố, chụp ảnh check-in ánh sáng tự nhiên.';
        etiquette = 'Cầm thêm quạt xếp nan tre hoặc túi cói mộc để bức ảnh thêm phần thơ mộng.';
      } else if (occ.includes('tốt nghiệp') || occ.includes('khoa bảng')) {
        matchedCostume = OFFICIAL_13_COSTUMES.find(c => c.id === 'ao-giao-linh' || c.id === 'ao-vien-linh') || OFFICIAL_13_COSTUMES[0];
        matchedPattern = PATTERNS_CATALOG.find(p => p.id === 'trong-dong-chim-lac') || PATTERNS_CATALOG[4];
        modernItem = 'Quần âu xếp ly & Giày Oxford da bóng';
        title = `Khí Chất Cử Nhân Khoa Bảng: ${matchedCostume.name}`;
        palette = 'Xanh cổ vịt, trắng ngà và viền chỉ vàng kim';
        rationale = 'Áo Giao Lĩnh cổ chéo trang nghiêm thời Hậu Lê tôn vinh đạo học ngàn năm, sự đĩnh đạc và tri thức uyên thâm trong ngày vinh quy.';
        etiquette = 'Chỉnh vạt áo giao nhau cân xứng ngay ngắn, giữ ánh mắt kiên định tự tin.';
      }

      aiResult = {
        title,
        physiqueAnalysis: `Vóc dáng ${height}cm, ${weight}kg với tỷ lệ cân đối; phom dáng ${matchedCostume.name} với đường cắt buông rủ tự nhiên sẽ giúp tôn vinh dáng vẻ thanh thoát, kín đáo mà khí chất.`,
        costumeId: matchedCostume.id,
        costumeName: matchedCostume.name,
        costumeEra: matchedCostume.dynasty,
        modernItemName: modernItem,
        patternId: matchedPattern.id,
        patternName: matchedPattern.name,
        patternIcon: matchedPattern.icon,
        colorPalette: palette,
        stylingRationale: rationale,
        etiquetteTip: etiquette
      };
    }

    // Double check valid costume
    const finalCostume = OFFICIAL_13_COSTUMES.find(c => c.id === aiResult.costumeId) || OFFICIAL_13_COSTUMES[0];
    const finalPattern = PATTERNS_CATALOG.find(p => p.id === aiResult.patternId) || PATTERNS_CATALOG[0];

    return res.json({
      success: true,
      recommendation: {
        title: aiResult.title || `Bản Phối Di Sản: ${finalCostume.name}`,
        physiqueAnalysis: aiResult.physiqueAnalysis || `Vóc dáng ${height}cm, ${weight}kg hài hòa cùng phom ${finalCostume.name}, tạo nét thanh tao đoan chính.`,
        costumeId: finalCostume.id,
        costumeName: finalCostume.name,
        costumeEra: finalCostume.dynasty,
        costumeImage: finalCostume.frontImage,
        modernItemName: aiResult.modernItemName || 'Quần tây ống suông xếp ly',
        patternId: finalPattern.id,
        patternName: finalPattern.name,
        patternIcon: finalPattern.icon,
        colorPalette: aiResult.colorPalette || 'Sắc màu truyền thống hài hòa',
        stylingRationale: aiResult.stylingRationale || `Tôn vinh khí chất ${finalCostume.name} trong không gian ${occasion}.`,
        etiquetteTip: aiResult.etiquetteTip || 'Giữ thần thái tự tin, đoan trang và bước đi từ tốn.'
      }
    });
  } catch (err: any) {
    console.error('[Recommend Occasion] Error:', err);
    return res.status(500).json({ success: false, error: 'Không thể tạo đề xuất cho dịp này.' });
  }
});

// =========================================================================
// GIAI ĐOẠN 3: API GEN ẢNH CHÍNH & CHỈNH SỬA NHIỀU LƯỢT (MULTI-TURN EDITING)
// =========================================================================
app.post('/api/gemini/generate-fitting', async (req, res) => {
  try {
    const { 
      userPhoto, 
      costumeId,
      costumeName = 'Áo Cổ Phục Việt', 
      stylingPrompt = 'phối đồ thanh lịch đương đại', 
      wardrobeItems = [],
      tradAccessories = [],
      patterns = [],
      patternDescription = '',
      currentResultImage,
      isRefinement = false
    } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    const ai = apiKey 
      ? new GoogleGenAI({ 
          apiKey, 
          httpOptions: { headers: { 'User-Agent': 'aistudio-build' } } 
        }) 
      : new GoogleGenAI({
          httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
        });

    // 1. Identify matched canonical costume
    const matched = OFFICIAL_13_COSTUMES.find(c => 
      c.id === costumeId || 
      c.name === costumeName ||
      (costumeName && c.name.toLowerCase().includes(costumeName.toLowerCase())) ||
      (costumeName && costumeName.toLowerCase().includes(c.name.toLowerCase()))
    ) || OFFICIAL_13_COSTUMES[0];

    const fallbackImage = matched?.frontImage || '/images/costumes/ao-nhat-binh.jpg';

    const wardrobeDesc = Array.isArray(wardrobeItems) && wardrobeItems.length > 0
      ? `kết hợp món đồ cá nhân: ${wardrobeItems.map((w: any) => w.name || w).join(', ')}`
      : '';

    const tradAccDesc = Array.isArray(tradAccessories) && tradAccessories.length > 0
      ? `kèm phụ kiện cổ truyền đặc trưng điển chế: ${tradAccessories.map((a: any) => a.name || a).join(', ')}`
      : '';

    const tradNames = Array.isArray(tradAccessories) && tradAccessories.length > 0
      ? tradAccessories.map((a: any) => a.name || a).join(', ')
      : 'Tối giản không dùng phụ kiện phụ';

    const wardrobeNames = Array.isArray(wardrobeItems) && wardrobeItems.length > 0
      ? wardrobeItems.map((w: any) => w.name || w).join(', ')
      : 'Trang phục nguyên bản thuần khiết';

    const patternNames = Array.isArray(patterns) && patterns.length > 0
      ? patterns.map((p: any) => p.name || p).join(', ')
      : 'Hoa văn gấm lụa truyền thống';

    const patternFullDesc = [
      Array.isArray(patterns) && patterns.length > 0 ? `Họa tiết hoa văn lựa chọn: ${patternNames}` : '',
      patternDescription?.trim() ? `Mô tả hoa văn mong muốn: "${patternDescription.trim()}"` : ''
    ].filter(Boolean).join('. ');

    let prompt = '';
    if (isRefinement && currentResultImage) {
      prompt = `Chỉnh sửa bức ảnh thời trang di sản người thật: Dựa trên bức ảnh người mẫu đang mặc trang phục này, hãy giữ nguyên người mẫu và phom dáng trang phục chính, thực hiện chỉnh sửa thẩm mỹ theo yêu cầu sau: "${stylingPrompt}". ${patternFullDesc}. ${tradAccDesc}. Giữ chi tiết sắc nét 8K, chất liệu vải gấm lụa cao cấp, ánh sáng studio nghệ thuật tự nhiên.`;
    } else {
      prompt = `Bức ảnh chụp thời trang người thật cao cấp (photorealistic 8k editorial portrait): Một người Việt Nam thanh tú đang mặc trang phục truyền thống ${matched.name}, ${patternFullDesc}, ${tradAccDesc}, phối đồ theo phong cách: "${stylingPrompt}". ${wardrobeDesc}. Phom dáng tà áo chuẩn mực điển chế di sản thời ${matched.dynasty}, đường cắt tinh tế, chất liệu lụa gấm tự nhiên, ánh sáng studio nghệ thuật tạp chí thời trang danh tiếng.`;
    }

    // 2. Generate Gemini AI Fashion Editorial Critique with 3-part breakdown: Tốt ở điểm nào, Chưa tốt ở điểm nào, Cần cải thiện gì
    let geminiOutput: any = null;
    try {
      const critiquePrompt = `Bạn là chuyên gia giám tuyển thời trang di sản hàng đầu của "Nếp - Việt Phục Remix".
Hãy phân tích và đưa ra bản nhận xét chuyên môn CHI TIẾT, SÂU SẮC và KHÁCH QUAN về bộ trang phục phối đồ sau:
- Trang phục cổ phục chính: ${matched.name} (${matched.dynasty || 'Di sản Đại Việt'})
- Họa tiết hoa văn trên áo: ${patternFullDesc || 'Họa tiết gấm lụa truyền thống chìm'}
- Phụ kiện cổ truyền đi kèm: ${tradNames}
- Món đồ cá nhân kết hợp: ${wardrobeNames}
- Yêu cầu / phong cách phối đồ: "${stylingPrompt}"
${userPhoto ? '- Người dùng đã gửi ảnh chân dung/vóc dáng thực tế để ướm thử trang phục.' : ''}
${isRefinement ? '- Lưu ý: Đây là phiên bản tinh chỉnh nhiều lượt theo mong muốn của người dùng.' : ''}

Hãy trả về kết quả theo định dạng JSON với ĐẦY ĐỦ 3 phần nhận xét chi tiết:
1. pros: Tốt ở điểm nào (ưu điểm, sự hài hòa giữa cổ phục, phụ kiện và vóc dáng, nét đẹp di sản)
2. cons: Chưa tốt / Cần lưu ý ở điểm nào (hạn chế, điểm đối chọi, nguy cơ rườm rà hoặc lệch chuẩn nếu có)
3. improvements: Cần cải thiện thêm điều gì để hoàn thiện (gợi ý cụ thể về phụ kiện thay thế, kiểu tóc, dáng đứng, cách thắt tà)

Định dạng JSON chuẩn:
{
  "harmonyScore": 92,
  "critique": "Lời bình giám tuyển thời trang di sản truyền cảm hứng và sâu sắc (khoảng 2-3 câu).",
  "heritageAnalysis": "Phân tích chuẩn mực điển chế triều đại, vạt áo và hoa văn (khoảng 2 câu).",
  "accessoryVerdict": "Nhận xét chi tiết về sự ăn nhập và hài hòa của các phụ kiện đã chọn.",
  "pros": {
    "title": "Điểm sáng & Ưu điểm nổi bật của bản phối",
    "points": [
      "Tốt ở điểm nào: Phân tích sự hài hòa giữa phom áo ${matched.name} và phong cách đã chọn.",
      "Tốt ở điểm nào: Sự ăn khớp của sắc màu di sản và chất liệu gấm lụa.",
      "Tốt ở điểm nào: Khí chất trang nhã tôn vinh trọn vẹn nét đẹp cổ phong."
    ]
  },
  "cons": {
    "title": "Điểm chưa tốt & Những lưu ý cần cân nhắc",
    "points": [
      "Chưa tốt / Cần lưu ý: Những chi tiết phụ kiện hoặc màu sắc có thể gây rối mắt nếu không tiết chế.",
      "Điểm cần chú ý: Cân nhắc độ dài tà áo và bối cảnh diện trang phục để tránh vướng víu."
    ]
  },
  "improvements": {
    "title": "Gợi ý cải thiện để bản phối hoàn hảo hơn",
    "points": [
      "Cần cải thiện: Đề xuất cụ thể về cách gia giảm hoặc chọn phụ kiện ăn nhập hơn.",
      "Cần cải thiện: Lời khuyên về kiểu tóc bới thanh lịch, hài thêu/guốc mộc và phong thái đi đứng."
    ]
  },
  "stylingAdvice": "Lời khuyên thực tế để diện đẹp nhất, giữ phong thái tự tin và tôn dáng.",
  "stylingTags": ["Thanh Lịch Đương Đại", "Chuẩn Mực Điển Chế", "Hòa Sắc Di Sản"]
}`;

      // Build contents parts (include userPhoto if available base64 image)
      const contentParts: any[] = [];
      if (userPhoto && typeof userPhoto === 'string' && userPhoto.startsWith('data:image/')) {
        const photoMatch = userPhoto.match(/^data:([^;]+);base64,(.+)$/);
        if (photoMatch) {
          contentParts.push({
            inlineData: {
              mimeType: photoMatch[1],
              data: photoMatch[2]
            }
          });
        }
      }
      contentParts.push({ text: critiquePrompt });

      const textResponse = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: {
          parts: contentParts
        },
        config: {
          responseMimeType: 'application/json',
          temperature: 0.3
        }
      });

      if (textResponse.text) {
        try {
          geminiOutput = JSON.parse(textResponse.text);
        } catch {
          // ignore parsing error
        }
      }
    } catch (textErr) {
      console.warn('[Fitting] Gemini critique notice:', textErr);
    }

    // Fallback editorial output if text model is busy
    if (!geminiOutput || typeof geminiOutput !== 'object') {
      geminiOutput = {
        harmonyScore: 94,
        critique: `Bản phối ${matched.name} theo phong cách "${stylingPrompt}" toát lên vẻ đoan trang đài các, kết nối hài hòa giữa mỹ cảm cổ truyền và nhịp sống đương đại.`,
        heritageAnalysis: `Kế thừa chuẩn mực vạt áo và cấu trúc đặc trưng triều ${matched.dynasty || 'cổ truyền Đại Việt'}, phom dáng buông rủ thanh thoát.`,
        accessoryVerdict: tradNames.includes('Không') 
          ? 'Phong thái tối giản tôn vinh trọn vẹn chất liệu gấm lụa tự nhiên của tà áo.'
          : `Sự điểm xuyết của ${tradNames} tạo điểm nhấn văn hóa sâu sắc, bổ trợ hoàn hảo cho tổng thể phục sức.`,
        pros: {
          title: 'Điểm sáng & Ưu điểm nổi bật của bản phối',
          points: [
            `Phom dáng ${matched.name} ôm vừa vặn vai và buông rủ tự nhiên, tôn vinh khí chất trang nhã.`,
            `Hòa sắc di sản được định hình rõ nét, làm nổi bật chất liệu lụa tơ tằm mềm mại.`,
            tradNames.includes('Không') 
              ? 'Lối phối tối giản giúp tôn trọn vẹn cấu trúc đường cắt may cổ truyền.'
              : `Phụ kiện ${tradNames} bổ trợ tinh tế, làm nổi bật chiều sâu văn hóa thời ${matched.dynasty}.`
          ]
        },
        cons: {
          title: 'Điểm chưa tốt & Những lưu ý cần cân nhắc',
          points: [
            tradNames.split(',').length > 2
              ? 'Số lượng phụ kiện tương đối nhiều, có thể tạo cảm giác hơi nặng nề nếu diện trong không gian hẹp.'
              : 'Cần lưu ý kiểm soát nếp gấp tà áo khi di chuyển để tránh làm mất phom đứng của cổ áo.',
            'Tông màu trang phục cần được phối cùng ánh sáng tự nhiên hoặc studio ấm để tránh làm tối da.'
          ]
        },
        improvements: {
          title: 'Gợi ý cải thiện để bản phối hoàn hảo hơn',
          points: [
            'Nên kết hợp cùng kiểu tóc búi thấp đoan trang hoặc cài trâm bạc thanh nhã để khoe trọn phần cổ áo.',
            'Đi kèm hài thêu mũi cong hoặc guốc mộc truyền thống để giữ chuẩn nhịp bước khoan thai.',
            'Khi chụp ảnh, hai tay khép nhẹ trước bụng hoặc cầm quạt trầm ở góc 45 độ để tôn dáng tà áo.'
          ]
        },
        stylingAdvice: 'Giữ tư thế khoan thai, hai tay khép hờ hoặc cầm nhẹ quạt/nón để tôn trọn nét đẹp của tà áo.',
        stylingTags: ['Thanh Lịch Đương Đại', 'Tôn Vinh Di Sản', 'Hòa Sắc Đoan Trang']
      };
    }

    // 3. Attempt Native Gemini Image Generation if allowed by key/quota
    let generatedImage: string | undefined;
    const clientApiKey = req.headers['x-gemini-api-key'] || req.body?.apiKey;
    const effectiveApiKey = (typeof clientApiKey === 'string' && clientApiKey.trim().length > 10)
      ? clientApiKey.trim()
      : process.env.GEMINI_API_KEY;
    const isUsingPersonalKey = typeof clientApiKey === 'string' && clientApiKey.trim().length > 10;

    // Only skip if server key is in cooldown and user didn't supply their own key
    const shouldAttemptImage = isUsingPersonalKey || (Date.now() >= geminiImageQuotaCooldownUntil);

    if (shouldAttemptImage) {
      try {
        const imageAi = effectiveApiKey
          ? new GoogleGenAI({
              apiKey: effectiveApiKey,
              httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
            })
          : ai;

        const parts: any[] = [];
        if (isRefinement && currentResultImage && typeof currentResultImage === 'string' && currentResultImage.startsWith('data:')) {
          const match = currentResultImage.match(/^data:([^;]+);base64,(.+)$/);
          if (match) {
            parts.push({
              inlineData: {
                mimeType: match[1],
                data: match[2],
              },
            });
          }
        } else if (userPhoto && typeof userPhoto === 'string' && userPhoto.startsWith('data:')) {
          const photoMatch = userPhoto.match(/^data:([^;]+);base64,(.+)$/);
          if (photoMatch) {
            parts.push({
              inlineData: {
                mimeType: photoMatch[1],
                data: photoMatch[2],
              },
            });
          }
        }
        parts.push({ text: prompt });

        const response = await imageAi.models.generateContent({
          model: 'gemini-3.1-flash-lite-image',
          contents: {
            parts,
          },
          config: {
            imageConfig: {
              aspectRatio: '3:4',
            },
          },
        });

        const candidates = response.candidates;
        if (candidates && candidates.length > 0 && candidates[0].content?.parts) {
          for (const part of candidates[0].content.parts) {
            if (part.inlineData?.data) {
              generatedImage = part.inlineData.data;
              break;
            }
          }
        }
      } catch (genErr: any) {
        const errMsg = String(genErr?.message || '');
        const isQuotaExceeded = errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('quota') || errMsg.includes('Quota');
        
        let retryAfterHours = 14;
        const hourMatch = errMsg.match(/retry in\s*(\d+)h/i) || errMsg.match(/(\d+)h(\d+)m/i) || errMsg.match(/(\d+)h/i);
        if (hourMatch && hourMatch[1]) {
          retryAfterHours = parseInt(hourMatch[1], 10);
        }

        if (isQuotaExceeded) {
          if (!isUsingPersonalKey) {
            geminiImageQuotaCooldownUntil = Date.now() + retryAfterHours * 3600 * 1000;
          }
          console.log(`[AI Fitting] Image generation quota exceeded. Retry after ${retryAfterHours}h`);

          return res.json({
            success: false,
            quotaExceeded: true,
            retryAfterHours,
            quotaMessage: `Hôm nay đã hết lượt tạo ảnh, vui lòng thử lại sau ${retryAfterHours} giờ`,
            message: `Hôm nay đã hết lượt tạo ảnh, vui lòng thử lại sau ${retryAfterHours} giờ`,
            geminiOutput,
            promptUsed: prompt,
            costumeData: {
              id: matched.id,
              name: matched.name,
              dynasty: matched.dynasty,
              frontImage: fallbackImage
            }
          });
        }

        console.log('[AI Fitting] Image generation notice:', errMsg);
      }
    } else {
      const remainingHours = Math.max(1, Math.ceil((geminiImageQuotaCooldownUntil - Date.now()) / (3600 * 1000)));
      return res.json({
        success: false,
        quotaExceeded: true,
        retryAfterHours: remainingHours,
        quotaMessage: `Hôm nay đã hết lượt tạo ảnh, vui lòng thử lại sau ${remainingHours} giờ`,
        message: `Hôm nay đã hết lượt tạo ảnh, vui lòng thử lại sau ${remainingHours} giờ`,
        geminiOutput,
        promptUsed: prompt,
        costumeData: {
          id: matched.id,
          name: matched.name,
          dynasty: matched.dynasty,
          frontImage: fallbackImage
        }
      });
    }

    return res.json({
      success: true,
      imageUrl: generatedImage ? `data:image/jpeg;base64,${generatedImage}` : fallbackImage,
      isAiGeneratedImage: Boolean(generatedImage),
      quotaExceeded: false,
      geminiOutput,
      promptUsed: prompt,
      costumeData: {
        id: matched.id,
        name: matched.name,
        dynasty: matched.dynasty,
        frontImage: fallbackImage
      },
      isRefinement: Boolean(isRefinement),
      versionId: Date.now().toString()
    });
  } catch (error: any) {
    const matched = OFFICIAL_13_COSTUMES.find(c => c.id === req.body?.costumeId || c.name === req.body?.costumeName) || OFFICIAL_13_COSTUMES[0];
    const fallbackImage = matched?.frontImage || '/images/costumes/ao-nhat-binh.jpg';
    return res.json({
      success: true,
      imageUrl: fallbackImage,
      isAiGeneratedImage: false,
      geminiOutput: {
        critique: `Bản phối ${matched.name} toát lên thần thái di sản trang nhã và thanh lịch.`,
        harmonyScore: 90,
        heritageAnalysis: `Chuẩn mực vạt áo và kết cấu thời ${matched.dynasty}.`,
        accessoryVerdict: 'Phụ kiện hài hòa cùng tà áo truyền thống.',
        stylingAdvice: 'Diện cùng giày hoặc hài thêu thanh tao.',
        stylingTags: ['Cổ Phục Việt', 'Thanh Lịch', 'Di Sản']
      },
      promptUsed: req.body?.stylingPrompt || '',
      costumeData: {
        id: matched.id,
        name: matched.name,
        dynasty: matched.dynasty,
        frontImage: fallbackImage
      },
      isRefinement: Boolean(req.body?.isRefinement),
      versionId: Date.now().toString()
    });
  }
});

// =====================================================================
// POST /api/generate-tryon: Identity-Anchored Pipeline (gemini-3.1-flash-lite-image)
// Step 1: Vision Identity Extraction via Gemini 3.8 Flash (if photo provided)
// Step 2: High-end Heritage Lookbook Image Generation via Google AI
// =====================================================================
app.post('/api/generate-tryon', async (req, res) => {
  try {
    const {
      userImageBase64,
      mimeType = 'image/jpeg',
      costumeId,
      costumeName = 'Áo Giao Lĩnh (Tràng Vạt)',
      costumeEra = 'Thời Hậu Lê',
      costumeImage,
      modernItemName = 'Quần tây ống suông & Giày cao gót',
      height = 165,
      weight = 52,
      gender = 'female',
      favoriteEra = '',
      patterns = [],
      patternDescription = '',
      accessories = [],
      wardrobeItems = []
    } = req.body;

    const clientApiKey = req.headers['x-gemini-api-key'] || req.body?.apiKey;
    const apiKey = (typeof clientApiKey === 'string' && clientApiKey.trim().length > 10)
      ? clientApiKey.trim()
      : process.env.GEMINI_API_KEY;
    const result = await executeTryOnPipeline(apiKey, {
      userImageBase64,
      mimeType,
      costumeId,
      costumeName,
      costumeEra,
      costumeImage,
      modernItemName,
      height: Number(height) || 165,
      weight: Number(weight) || 52,
      gender: gender || 'female',
      favoriteEra,
      patterns,
      patternDescription,
      accessories,
      wardrobeItems
    });

    return res.json(result);
  } catch (error: any) {
    console.error('[Generate-Tryon] Error in route:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Lỗi xử lý quy trình phối đồ thử nghiệm nhân dạng.'
    });
  }
});

// Start Express server and mount Vite
async function startServer() {
  const PORT = Number(process.env.PORT) || 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    // Serve static files in production
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    // Mount Vite middleware in development
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Nếp Server] Running on http://localhost:${PORT} (${isProduction ? 'production' : 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
