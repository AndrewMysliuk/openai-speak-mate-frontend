import { IErrorAnalysisEntity } from "./IErrorAnalysis"
import { GPTRoleType, IGPTPayload, ITextAnalysisResponse } from "./IGPT"

export type TTSVoiceType = "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer"

export type TTSModelType = "tts-1" | "tts-1-hd"

export type TTSModelFormatsType = "mp3" | "opus" | "aac" | "flac" | "wav" | "pcm"

export interface ITTSPayload {
  model: TTSModelType
  voice: TTSVoiceType
  response_format?: TTSModelFormatsType
  speed?: number
}

export interface IConversationWhisper {
  audio_file: Blob
  prompt?: string
}

export interface IConversationPayload {
  whisper: IConversationWhisper
  gpt_model: IGPTPayload
  tts: ITTSPayload
  system: {
    session_id?: string
    global_prompt: string
  }
}

export enum StreamEventEnum {
  TRANSCRIPTION = "TRANSCRIPTION",
  GPT_RESPONSE = "GPT_RESPONSE",
  TTS_CHUNK = "TTS_CHUNK",
  ERROR = "ERROR",
  COMPLETE = "COMPLETE",
}

export interface IHistoryStreamEvent {
  type: StreamEventEnum.TRANSCRIPTION
  role: "user"
  content: string
  audio_url: string
}

export interface IGptResponseStreamEvent {
  type: StreamEventEnum.GPT_RESPONSE
  role: "assistant"
  content: string
}

export interface ITtsChunkStreamEvent {
  type: StreamEventEnum.TTS_CHUNK
  role: "assistant"
  audioChunk: string
}

export interface IErrorStreamEvent {
  type: StreamEventEnum.ERROR
  role: "system"
  content: string
}

export type ConversationShortResponse = IGptResponseStreamEvent | IHistoryStreamEvent

export type ConversationStreamEvent = IHistoryStreamEvent | IGptResponseStreamEvent | ITtsChunkStreamEvent | IErrorStreamEvent

export interface IConversationHistory {
  session_id: string
  pair_id: string
  role: GPTRoleType
  content: string
  audio_url?: string
  created_at: Date
}

export interface IConversationResponse {
  session_id: string
  conversation_history: IConversationHistory[]
  last_model_response: ITextAnalysisResponse
  error_analyser_response: IErrorAnalysisEntity | null
}
