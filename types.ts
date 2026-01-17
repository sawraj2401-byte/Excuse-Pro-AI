
export type Tone = 'Professional' | 'Dramatic' | 'Funny' | 'Apologetic' | 'Short & Blunt' | 'Casual' | 'Custom...';
export type ReasonType = 'Transport' | 'Family' | 'Technical' | 'Creative' | 'Honest-ish' | 'Work-related' | 'Custom...';
export type Recipient = 'Boss' | 'Teacher' | 'Partner' | 'Friend' | 'Client' | 'Parent' | 'Custom...';

export interface ExcuseRequest {
  situation: string;
  recipient: string;
  reasonType: string;
  tone: string;
  additionalDetails?: string;
}

export interface GeneratedExcuse {
  id: string;
  text: string;
  timestamp: number;
  isFavorite?: boolean;
}

export interface ChatMessage {
  role: 'user' | 'model';
  parts: [{ text: string }];
}
