import { ChatMessage, ExplainResponse } from './ai.model';

export type SavedHistoryType = 'explain' | 'chat';

export interface SavedChatContent {
  messages: ChatMessage[];
  reply: string;
}

export interface SavedHistoryItem {
  id: string;
  type: SavedHistoryType;
  topicId: string;
  topicTitle: string;
  language: string;
  content: ExplainResponse | SavedChatContent;
  savedAt: string;
}

export interface HistoryResponse {
  items: SavedHistoryItem[];
}

export interface SaveHistoryRequest {
  type: SavedHistoryType;
  topicId: string;
  topicTitle: string;
  language: string;
  content: ExplainResponse | SavedChatContent;
}

export interface SavedTopic {
  topicId: string;
  topicTitle: string;
  category: string;
  readTime: string;
  summary: string;
  savedAt: string;
}

export interface SavedTopicsResponse {
  items: SavedTopic[];
}

export interface SaveTopicRequest {
  topicId: string;
  topicTitle: string;
  category: string;
  readTime: string;
  summary: string;
}