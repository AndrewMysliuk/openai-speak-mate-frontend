<template>
  <div class="room" :class="{ '--sidebar-opened': isSidebarOpen }">
    <transition name="slide-left">
      <ConversationSidebarSendbox v-if="isSidebarOpen" />
    </transition>

    <div class="room__body">
      <div class="conversation">
        <div class="conversation__analyser" v-if="getUserHistory?.length > 15">
          <v-button label="Analyse Conversation" buttonStyle="action" @click="analyseUserConversation" />
        </div>

        <div class="conversation__history" v-if="getConversationResponse?.conversation_history?.length">
          <v-button label="Toggle History" buttonStyle="regular" @click="isSidebarOpen = !isSidebarOpen" />
        </div>

        <div class="conversation__description" v-if="getLastModelFullAnswer && !isHold">
          <p v-if="audioElementRef" v-animate-text="{ text: getLastModelFullAnswer }" />

          <div class="conversation__warning" v-if="getLastModelTip" v-html="getLastModelTip" />
        </div>

        <div class="conversation__description" v-else-if="!isLoading && !isHold">
          <i class="fa-solid fa-keyboard" />
          <p>Press and hold Spacebar to start recording</p>
        </div>

        <div v-else-if="isHold" class="conversation__description">
          <i class="fa-solid fa-volume-high" />
          <p>Recording in progress... Speak now!</p>
        </div>

        <div v-else-if="isLoading" class="conversation__description">
          <span class="--pulse" />
          <p>Processing your recording...</p>
        </div>

        <div class="conversation__info --left" v-if="!getIsLoading" @click="repeatLastAudio">
          <i class="fa-solid fa-repeat" />
        </div>

        <div class="conversation__info" @click="isModalInfoOpen = true">
          <i class="fa-regular fa-circle-question" />
        </div>

        <div class="conversation__visualization --client" v-if="isHold">
          <canvas ref="clientCanvasRef" />
        </div>

        <div class="conversation__visualization --prompt" v-else-if="!isHold && getConversationResponse?.conversation_history?.length && !isLoading">
          <p>Press and hold Spacebar to interrupt and start recording</p>
        </div>
      </div>
    </div>

    <v-modal v-model="isModalInfoOpen" is-curtain>
      <InfoModal />
    </v-modal>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onBeforeUnmount, computed, onBeforeMount, nextTick, watch } from "vue"
import { conversationStore, audioPlayer, promptStore, errorAnalysisStore } from "@/app"
import { useRouter } from "vue-router"
import { useMicrophone, initializeCanvasForConversation } from "@/shared/lib"
import helloRecord from "@/shared/assets/records/hello_record.wav"
import { ConversationSidebarSendbox, InfoModal } from "./ui"

export default defineComponent({
  components: {
    ConversationSidebarSendbox,
    InfoModal,
  },

  setup() {
    const router = useRouter()
    const clientCanvasRef = ref<HTMLCanvasElement | null>(null)
    const audioElementRef = ref<HTMLAudioElement | null>(null)
    const isModalInfoOpen = ref<boolean>(false)
    const isSidebarOpen = ref<boolean>(false)
    const isLoading = ref<boolean>(false)
    const isHold = ref<boolean>(false)
    let mediaRecorder: MediaRecorder | null = null
    let mediaStream: MediaStream | null = null
    let audioChunks: BlobPart[] = []
    let cleanupCanvas: (() => void) | null = null

    const getIsLoading = computed(() => conversationStore.getIsLoading)
    const getConversationResponse = computed(() => conversationStore.getConversationResponse)
    const getUserHistory = computed(() => getConversationResponse.value.conversation_history?.filter((item) => item.role === "user"))
    const getLastModelFullAnswer = computed(() => conversationStore.getLastModelFullAnswer)
    const getLastModelTip = computed(() => errorAnalysisStore.getLastModelTip)
    const getSelectedPrompt = computed(() => promptStore.getSelectedPrompt)

    onBeforeMount(async () => {
      if (!Object.keys(getSelectedPrompt.value)?.length) {
        nextTick(() => {
          router.push({ name: "sendbox.conversation-dashboard" })
        })
      } else {
        await simulateGreeting()
      }
    })

    onMounted(() => {
      window.addEventListener("keydown", handleKeyDown)
      window.addEventListener("keyup", handleKeyUp)
    })

    const analyseUserConversation = () => {
      const history = {
        ...getConversationResponse.value,
        conversation_history: getConversationResponse.value.conversation_history.filter((item) => item.role !== "system"),
      }

      localStorage.setItem("last_conversation_history", JSON.stringify(history))

      // TODO
    }

    const repeatLastAudio = async () => {
      if (!audioElementRef.value) return

      audioElementRef.value.pause()
      audioElementRef.value.currentTime = 0
      audioElementRef.value.play()
    }

    const simulateGreeting = async () => {
      try {
        const response = await fetch(helloRecord)
        const audioBlob = await response.blob()

        if (!audioBlob) return

        isLoading.value = true

        await conversationStore.fetchConversation({
          whisper: { audio_file: audioBlob },
          gpt_model: { model: "gpt-4o-mini", max_tokens: 1500 },
          tts: { model: "tts-1", voice: "alloy", response_format: "mp3" },
          system: {
            session_id: getConversationResponse.value?.session_id ?? "",
            global_prompt: getSelectedPrompt.value?.prompt,
          },
        })
      } catch (error) {
        console.error("Error simulating greeting:", error)
      } finally {
        isLoading.value = false
      }
    }

    const handleKeyDown = async (e: KeyboardEvent) => {
      if (e.code === "Space" && !isHold.value && !isLoading.value) {
        e.preventDefault()
        isHold.value = true
        conversationStore.setLastModelFullAnswer("")
        audioPlayer.interruptAndClear()
        await startRecording()
      }
    }

    const handleKeyUp = async (e: KeyboardEvent) => {
      if (e.code === "Space" && isHold.value) {
        e.preventDefault()
        await stopRecording()
        isHold.value = false
      }
    }

    const startRecording = async () => {
      if (isLoading.value || mediaRecorder) return

      try {
        mediaStream = await useMicrophone()
        audioChunks = []
        const recordingStartTime = Date.now()

        if (!mediaStream) return

        mediaRecorder = new MediaRecorder(mediaStream, { mimeType: "audio/webm;codecs=opus" })

        if (clientCanvasRef.value) {
          cleanupCanvas = initializeCanvasForConversation(clientCanvasRef.value, mediaStream)
        }

        mediaRecorder.ondataavailable = (event: BlobEvent) => {
          audioChunks.push(event.data)
        }

        mediaRecorder.onstop = async () => {
          if (audioChunks.length === 0) return

          const audioBlob = new Blob(audioChunks, { type: "audio/wav" })
          audioChunks = []

          const recordingDuration = Date.now() - (recordingStartTime ?? 0)
          if (recordingDuration < 125) return

          isLoading.value = true

          try {
            errorAnalysisStore.resetLastModelTip()

            await conversationStore.fetchConversation({
              whisper: { audio_file: audioBlob },
              gpt_model: { model: "gpt-4o-mini", max_tokens: 1500 },
              tts: { model: "tts-1", voice: "alloy", response_format: "mp3" },
              system: {
                session_id: getConversationResponse.value?.session_id ?? "",
                global_prompt: getSelectedPrompt.value?.prompt,
              },
            })

            await errorAnalysisStore.fetchErrorAnalysis({
              gpt_payload: {
                model: "gpt-4o-mini",
                max_tokens: 1500,
                messages: getConversationResponse.value.conversation_history.map((item) => ({ role: item.role, content: item.content })),
              },
              session_id: getConversationResponse.value?.session_id ?? "",
            })
          } catch (error) {
            console.error("Error fetching conversation:", error)
          } finally {
            isLoading.value = false
          }

          if (cleanupCanvas) await cleanupCanvas()
        }

        mediaRecorder.start()
      } catch (error: unknown) {
        console.log(error)
        if (cleanupCanvas) await cleanupCanvas()
      }
    }

    const stopRecording = async () => {
      if (mediaRecorder && mediaRecorder.state === "recording") {
        mediaRecorder.stop()
      }

      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop())
        mediaStream = null
      }

      if (cleanupCanvas) {
        await cleanupCanvas()
        cleanupCanvas = null
      }

      mediaRecorder = null
    }

    watch(
      () => audioPlayer.audioElement.value,
      (newElement) => {
        if (newElement) {
          audioElementRef.value = newElement
        }
      }
    )

    onBeforeUnmount(async () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    })

    return {
      clientCanvasRef,
      audioElementRef,
      isModalInfoOpen,
      isSidebarOpen,
      isLoading,
      isHold,
      getIsLoading,
      getUserHistory,
      getLastModelFullAnswer,
      getLastModelTip,
      getConversationResponse,
      analyseUserConversation,
      repeatLastAudio,
    }
  },
})
</script>
