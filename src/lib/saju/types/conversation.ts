import type { SajuReport } from './report';

/**
 * 대화 메시지
 */
export interface Message {
	role: 'user' | 'assistant';
	content: string;
	timestamp: Date;
}

/**
 * 대화 컨텍스트
 */
export interface ConversationContext {
	conversationId: string;
	sajuReport: SajuReport;
	messages: Message[];
	createdAt: Date;
	updatedAt: Date;
}

/**
 * 채팅 요청
 */
export interface ChatRequest {
	conversationId?: string;
	message: string;
	sajuReport?: SajuReport;
}

/**
 * 채팅 응답
 */
export interface ChatResponse {
	conversationId: string;
	reply: string;
	timestamp: Date;
}