'use server';

import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY! });

const SYSTEM_PROMPT = `Bạn là một chuyên gia ngôn ngữ học tiếng Nhật. Nhiệm vụ của bạn là phân tích câu tiếng Nhật và trích xuất:
1. Từ vựng: Chuyển về dạng từ điển (dictionary form), kèm furigana, kanji, nghĩa tiếng Việt, từ loại, cấp độ JLPT.
2. Ngữ pháp: Các mẫu ngữ pháp trong câu, cấu trúc, giải thích, ví dụ, cấp độ JLPT.
3. Kanji: Từng chữ Hán đơn lẻ, âm Hán-Việt (IN HOA), âm On, âm Kun, nghĩa, cấp độ JLPT.

Lưu ý:
- Nghĩa bằng tiếng Việt.
- Với ảnh: trích xuất chính xác text tiếng Nhật từ ảnh trước, rồi phân tích.
- Loại bỏ các trợ từ đơn giản như は, が, を, の, に, へ, で, も, と khỏi danh sách từ vựng (chúng là ngữ pháp/trợ từ, không phải từ vựng).
- Với động từ được chia trong câu (例: 食べた, 食べている), trả về dạng từ điển (食べる) làm word chính và ghi chú dạng chia trong conjugated_form.`;

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
          explanation: { type: 'string' as const, description: 'Explanation in Vietnamese' },
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
          onyomi: { type: 'string' as const },
          kunyomi: { type: 'string' as const },
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

  const response = await ai.models.generateContent({
    model: 'gemini-3.6-flash',
    contents: [{ role: 'user', parts }],
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: 'application/json',
      responseSchema: RESPONSE_SCHEMA,
      temperature: 0.1,
    },
  });

  const text = response.text;
  if (!text) throw new Error('No response from Gemini');
  return JSON.parse(text) as GeminiScanResponse;
}
