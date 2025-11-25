export class AiResponseDto {
  translation: {
    originalText: string;
    translatedText: string;
    targetLanguage: string;
  };
  correctionSuggestions: {
    suggestionText: string;
    reason: string;
  };
}
