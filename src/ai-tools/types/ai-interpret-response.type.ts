export class AiResponseInterface {
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
