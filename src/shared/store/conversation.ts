import { computed, ref } from "vue"
import { defineStore } from "pinia"
import { urlAudioPlayer } from "@/app"
import { createConversationHandler } from "../api"
import { IConversationResponse, IConversationPayload, StreamEventEnum, ConversationShortResponse } from "../types"
import { createTypewriterStream } from "../utils"

export const useConversationStore = defineStore("conversationStore", () => {
  const conversationResponse = ref<IConversationResponse>({ session_id: "", conversation_history: [], last_model_response: "" })
  const lastModelFullAnswer = ref<string>("")
  const lastModelAudioUrl = ref<string>("")
  const gptResponses = ref<ConversationShortResponse[]>([])
  const isLoading = ref<boolean>(false)

  const getConversationResponse = computed(() => conversationResponse.value)
  const getLastModelFullAnswer = computed(() => lastModelFullAnswer.value)
  const getLastModelAudioUrl = computed(() => lastModelAudioUrl.value)
  const getGptResponses = computed(() => gptResponses.value)
  const getIsLoading = computed(() => isLoading.value)

  const fetchConversation = async (payload: IConversationPayload, abortSignal: AbortSignal) => {
    isLoading.value = true
    gptResponses.value = []
    resetLastModelFullAnswer()

    const typewriterHandler = createTypewriterStream({
      delayPerChar: 20,
      onChar: (char) => {
        lastModelFullAnswer.value += char
      },
    })

    await createConversationHandler(
      payload,
      (data) => {
        switch (data.type) {
          case StreamEventEnum.TRANSCRIPTION:
            gptResponses.value.push({ type: data.type, role: data.role, content: data.content, audio_url: data.audio_url })
            break
          case StreamEventEnum.GPT_RESPONSE:
            // SetTimeout only for google TTS
            setTimeout(() => {
              gptResponses.value.push({ type: data.type, role: data.role, content: data.content })
              typewriterHandler(data.content)
            }, 1000)
            break
          case StreamEventEnum.TTS_CHUNK:
            // audioPlayer.addToQueue(data.audioChunk)
            break
          case StreamEventEnum.TTS_LINK:
            lastModelAudioUrl.value = data.audioUrl

            urlAudioPlayer.playUrl(data.audioUrl)
            break
          case StreamEventEnum.ERROR:
            console.error("AI Error:", data.content)
            break
        }
      },
      abortSignal
    )
      .then((response: IConversationResponse) => {
        conversationResponse.value = response
      })
      .catch((error: unknown) => {
        throw error
      })
      .finally(() => {
        isLoading.value = false
      })
  }

  const resetLastModelFullAnswer = () => {
    lastModelFullAnswer.value = ""
  }

  const resetAll = () => {
    conversationResponse.value = { session_id: "", conversation_history: [], last_model_response: "" }
    lastModelFullAnswer.value = ""
    lastModelAudioUrl.value = ""
    gptResponses.value = []
    isLoading.value = false
  }

  return {
    getConversationResponse,
    getLastModelFullAnswer,
    getLastModelAudioUrl,
    getGptResponses,
    getIsLoading,
    resetAll,
    fetchConversation,
    resetLastModelFullAnswer,
  }
})
