import { GoogleGenAI } from '@google/genai';

function getAIClient() {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    throw new Error('Chưa cấu hình GOOGLE_AI_API_KEY trên Vercel.');
  }
  return new GoogleGenAI({ apiKey });
}

const SYSTEM_PROMPT = `Bạn là một chuyên gia ngôn ngữ học tiếng Nhật và giáo viên dạy tiếng Nhật chuyên nghiệp. Nhiệm vụ của bạn là phân tích câu hoặc từ vựng tiếng Nhật và trích xuất thành JSON:

1. TỪ VỰNG (vocabularies):
- ĐỘNG TỪ BẮT BUỘC PHẢI ĐƯA VỀ DẠNG NGUYÊN THỂ TỪ ĐIỂN (Dictionary Form - 辞書形, kết thúc bằng âm hàng -u: う, く, ぐ, す, つ, ぬ, ぶ, む, る).
  * Ví dụ: Nếu người dùng nhập hoặc ảnh có "死にたい", "死んだ", "死んでいる", "死なない", "死ね" -> word bắt buộc phải là "死ぬ", nghĩa là "chết, qua đời", conjugated_form ghi "死にたい", word_type là "Động từ nhóm 1".
  * Tuyệt đối KHÔNG ĐƯỢC lưu "死にたい", "食べたい" làm từ vựng riêng biệt dưới dạng "Tính từ đuôi い".
- TÍNH TỪ: Đưa về dạng từ điển (đuôi い hoặc đuôi な).
- Trích xuất furigana, kanji, nghĩa tiếng Việt chuẩn xác, phân loại từ loại chi tiết (Động từ nhóm 1, Động từ nhóm 2, Động từ nhóm 3, Danh từ, Tính từ đuôi い, v.v.) và cấp độ JLPT (N5-N1).

2. NGỮ PHÁP (grammars):
- Nếu từ/câu có sử dụng bất kỳ cấu trúc ngữ pháp hay dạng chia động từ nào (như ～たい, ～ている, ～た, ～ない, ～ば, ～られる, ～させる, ～てはいけない, v.v.):
  * BẮT BUỘC phải trích xuất mẫu ngữ pháp đó vào "grammars". Ví dụ với "死にたい" -> trích xuất ngữ pháp "～たい (Muốn làm V)".
  * "title": Tên mẫu ngữ pháp (ví dụ: "～たい (V-たい)").
  * "structure": Công thức kết hợp tổng quát (ví dụ: "V[ます] bỏ ます + たい").
  * "explanation": Giải thích nghĩa tiếng Việt VÀ BẮT BUỘC CÓ HƯỚNG DẪN CHI TIẾT CÁCH CHIA/ÁP DỤNG VỚI CẢ 3 NHÓM ĐỘNG TỪ:
    - Nhóm 1 (Godan): [Quy tắc đổi âm kèm ví dụ]
    - Nhóm 2 (Ichidan): [Quy tắc bỏ る kèm ví dụ]
    - Nhóm 3 (Bất quy tắc): [Nêu rõ cách chia của する và くる (来る)]
  * "nuance": Sắc thái, lưu ý cách dùng (ví dụ: dùng cho ngôi 1 mong muốn bản thân, ngôi 3 dùng ～たがる).
  * "example_sentence" & "example_meaning": Câu ví dụ minh họa và nghĩa tiếng Việt.
- Nếu chỉ nhập một danh từ đơn thuần (như "猫", "本") hoàn toàn không có cấu trúc ngữ pháp nào, thì grammars trả về mảng rỗng [].

3. KANJI (kanjis):
- Từng chữ Hán đơn lẻ.
- "han_viet": Âm Hán-Việt IN HOA (ví dụ: "TỬ", "THẾ").
- "onyomi": CHỈ gồm các âm Katakana ngắn gọn ngăn cách bằng dấu phẩy (ví dụ: "シ"). KHÔNG chứa chữ cái Latin, tiếng Anh hay bất kỳ từ nào khác.
- "kunyomi": CHỈ gồm các âm Hiragana ngắn gọn ngăn cách bằng dấu phẩy (ví dụ: "し.ぬ"). KHÔNG chứa chữ cái Latin, tiếng Anh hay bất kỳ từ nào khác.
- "meaning": Nghĩa tiếng Việt.
- "jlpt_level": Cấp độ JLPT.

Lưu ý:
- Nghĩa 100% bằng tiếng Việt.
- Trả về JSON thuần túy theo Schema.`;

const RESPONSE_SCHEMA = {
  type: 'object' as const,
  properties: {
    original_text: { type: 'string' as const, description: 'Original Japanese text extracted' },
    translation: { type: 'string' as const, description: 'Vietnamese translation of the full text' },
    vocabularies: {
      type: 'array' as const,
      items: {
        type: 'object' as const,
        properties: {
          word: { type: 'string' as const, description: 'Dictionary form' },
          conjugated_form: { type: 'string' as const, description: 'Form as it appears in the sentence' },
          furigana: { type: 'string' as const, description: 'Hiragana reading' },
          kanji: { type: 'string' as const, description: 'Kanji writing if applicable' },
          meaning: { type: 'string' as const, description: 'Vietnamese meaning' },
          word_type: { type: 'string' as const, description: 'Part of speech in Vietnamese' },
          jlpt_level: { type: 'string' as const, enum: ['N5', 'N4', 'N3', 'N2', 'N1'] },
        },
        required: ['word', 'furigana', 'meaning', 'jlpt_level'] as const,
      },
    },
    grammars: {
      type: 'array' as const,
      items: {
        type: 'object' as const,
        properties: {
          title: { type: 'string' as const },
          structure: { type: 'string' as const },
          explanation: { type: 'string' as const, description: 'Detailed explanation in Vietnamese with 3 verb group rules' },
          jlpt_level: { type: 'string' as const, enum: ['N5', 'N4', 'N3', 'N2', 'N1'] },
          example_sentence: { type: 'string' as const },
          example_meaning: { type: 'string' as const, description: 'Vietnamese meaning of example' },
          nuance: { type: 'string' as const, description: 'formal/informal/anime slang' },
        },
        required: ['title', 'structure', 'explanation', 'jlpt_level'] as const,
      },
    },
    kanjis: {
      type: 'array' as const,
      items: {
        type: 'object' as const,
        properties: {
          character: { type: 'string' as const },
          han_viet: { type: 'string' as const, description: 'Sino-Vietnamese reading IN UPPERCASE' },
          onyomi: { type: 'string' as const, description: 'Katakana only, e.g. シ' },
          kunyomi: { type: 'string' as const, description: 'Hiragana only, e.g. し.ぬ' },
          meaning: { type: 'string' as const, description: 'Vietnamese meaning' },
          jlpt_level: { type: 'string' as const, enum: ['N5', 'N4', 'N3', 'N2', 'N1'] },
          example_words: {
            type: 'array' as const,
            items: {
              type: 'object' as const,
              properties: {
                word: { type: 'string' as const },
                furigana: { type: 'string' as const },
                meaning: { type: 'string' as const },
              },
              required: ['word', 'furigana', 'meaning'] as const,
            },
          },
        },
        required: ['character', 'han_viet', 'meaning', 'jlpt_level'] as const,
      },
    },
  },
  required: ['original_text', 'translation', 'vocabularies', 'grammars', 'kanjis'] as const,
};

export interface GeminiScanResponse {
  original_text: string;
  translation: string;
  vocabularies: {
    word: string;
    conjugated_form?: string;
    furigana: string;
    kanji?: string;
    meaning: string;
    word_type?: string;
    jlpt_level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
  }[];
  grammars: {
    title: string;
    structure?: string;
    explanation: string;
    jlpt_level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
    example_sentence?: string;
    example_meaning?: string;
    nuance?: string;
  }[];
  kanjis: {
    character: string;
    han_viet: string;
    onyomi?: string;
    kunyomi?: string;
    meaning: string;
    jlpt_level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
    example_words?: { word: string; furigana: string; meaning: string }[];
  }[];
}

export async function analyzeJapanese(
  input: string | { base64: string; mimeType: string }
): Promise<GeminiScanResponse> {
  const parts: Array<{ text: string } | { inlineData: { data: string; mimeType: string } }> = [];

  if (typeof input === 'string') {
    parts.push({ text: `Phân tích câu tiếng Nhật sau:\n\n${input}` });
  } else {
    parts.push(
      { inlineData: { data: input.base64, mimeType: input.mimeType } },
      { text: 'Trích xuất và phân tích toàn bộ text tiếng Nhật trong ảnh này.' }
    );
  }

  const models = ['gemini-3.5-flash-lite', 'gemini-3.5-flash', 'gemini-3.6-flash'];
  let lastError: Error | null = null;

  for (const model of models) {
    try {
      const ai = getAIClient();
      const response = await ai.models.generateContent({
        model,
        contents: [{ role: 'user', parts }],
        config: {
          systemInstruction: SYSTEM_PROMPT,
          responseMimeType: 'application/json',
          responseSchema: RESPONSE_SCHEMA,
          temperature: 0.2,
          maxOutputTokens: 2048,
        },
      });

      const text = response.text;
      if (text) {
        return JSON.parse(text) as GeminiScanResponse;
      }
    } catch (err) {
      console.warn(`Model ${model} failed, trying fallback:`, err);
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }

  throw lastError || new Error('Không thể phân tích dữ liệu qua AI');
}
