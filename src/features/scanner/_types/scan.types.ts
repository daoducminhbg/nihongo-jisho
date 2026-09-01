export interface ScannedVocab {
  word: string;
  conjugated_form?: string;
  furigana: string;
  kanji?: string;
  meaning: string;
  word_type?: string;
  jlpt_level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
  isNew?: boolean;
  existingId?: string;
  existingFrequency?: number;
  selected?: boolean;
}

export interface ScannedKanji {
  character: string;
  han_viet: string;
  onyomi?: string;
  kunyomi?: string;
  meaning: string;
  jlpt_level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
  example_words?: { word: string; furigana: string; meaning: string }[];
  isNew?: boolean;
  existingId?: string;
  selected?: boolean;
}

export interface ScannedGrammar {
  title: string;
  structure?: string;
  explanation: string;
  jlpt_level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
  example_sentence?: string;
  example_meaning?: string;
  nuance?: string;
  isNew?: boolean;
  existingId?: string;
  selected?: boolean;
}

export interface ScanResult {
  original_text: string;
  translation: string;
  vocabularies: ScannedVocab[];
  grammars: ScannedGrammar[];
  kanjis: ScannedKanji[];
}
