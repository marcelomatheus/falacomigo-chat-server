import {
  Injectable,
  ForbiddenException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { InterpretMessageDto } from './dto/interpret-message.dto';
import { AiResponseInterface } from './types/ai-interpret-response.type';
import { ProfileService } from '@/profile/profile.service';
import { GroqService } from '@/groq/groq.service';
import { MessageService } from '@/message/message.service';
import { generatePrompt } from './auxiliary-methods/interpret-message-prompt';
import { DeepCorrectionsService } from '@/deep-corrections/deep-corrections.service'; // Adicionado
import { CreateDeepCorrectionsDto } from '@/deep-corrections/dto/create-deep-corrections.dto'; // Adicionado

@Injectable()
export class AiToolsService {
  constructor(
    private readonly profile: ProfileService,
    private readonly message: MessageService,
    private readonly groq: GroqService,
    private readonly deepCorrectionsService: DeepCorrectionsService, // Adicionado
  ) {}

  async interpretMessage(
    interpretMessageDto: InterpretMessageDto,
  ): Promise<AiResponseInterface> {
    const { content, senderId, messageId } = interpretMessageDto;

    const profileData = await this.profile.findOne(senderId);

    if (!profileData) {
      throw new BadRequestException('Profile not found.');
    }

    if (profileData.tokensBalance < 1) {
      throw new ForbiddenException('Insufficient tokens balance.');
    }

    const targetLang = profileData.learningLang || 'en';
    const systemPrompt = generatePrompt(targetLang);

    let rawContent: string | null | undefined;

    try {
      rawContent = await this.groq.chat({
        systemPrompt,
        content,
      });
    } catch (_error) {
      throw new InternalServerErrorException('AI Service unavailable.');
    }

    if (!rawContent) {
      throw new InternalServerErrorException('Empty response from AI Service.');
    }

    let aiResponse: AiResponseInterface;

    try {
      const cleanJson = rawContent.replace(/```json|```/g, '').trim();

      aiResponse = JSON.parse(cleanJson) as AiResponseInterface;
    } catch (_error) {
      throw new InternalServerErrorException(
        'Failed to process AI response format.',
      );
    }

    aiResponse.translation.translatedText ??=
      'Não há tradução disponível para esta mensagem.';

    await this.profile.update(senderId, {
      tokensBalance: profileData.tokensBalance - 1,
    });

    await this.message.update(messageId, {
      translation: aiResponse.translation,
      correctionSuggestions: aiResponse.correctionSuggestions,
    });

    if (aiResponse.deepCorrections && aiResponse.deepCorrections.length > 0) {
      const correctionsToCreate: CreateDeepCorrectionsDto[] =
        aiResponse.deepCorrections.map((correction) => ({
          title: correction.title,
          explanation: correction.explanation,
          example: correction.example,
          profileId: senderId,
          messageId: messageId,
          targetLanguage: targetLang,
        }));

      await this.deepCorrectionsService.createMany(correctionsToCreate);
    }

    return aiResponse;
  }
}
