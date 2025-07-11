<template>
  <div class="flex-grow min-h-0">
    <TheLoader v-if="!isReady || getIsPageLoading" />

    <div class="pt-16" v-else>
      <div class="px-6 py-10" v-if="isSingle && getCurrentReview">
        <h1 class="text-3xl font-bold text-text-base mb-6">
          {{ getCurrentReview.topic_title }}
        </h1>

        <div class="bg-stone-50 rounded-2xl p-6 border border-stone-200 shadow-sm space-y-6">
          <!-- META + TAGS -->
          <div class="flex items-center gap-3 text-sm text-gray-600">
            <span class="bg-gray-200 text-xs text-gray-800 px-2 py-0.5 rounded-full">
              {{ getCurrentReview.target_language }}
            </span>
            <span v-if="getCurrentReview.user_ielts_mark" class="bg-blue-100 text-xs text-blue-800 font-medium px-2 py-0.5 rounded-full">
              IELTS: {{ getCurrentReview.user_ielts_mark.toFixed(1).replace(".", ",") }}
            </span>
            <span v-else-if="getCurrentReview.user_cefr_level" class="bg-green-100 text-xs text-green-800 font-medium px-2 py-0.5 rounded-full">
              {{ getCurrentReview.user_cefr_level.level }}
            </span>

            <!-- GENERATE PUBLIC LINK -->
            <button @click="generatePublicLink" class="ml-auto bg-[#5B3DF5] hover:bg-[#452ee0] text-white text-sm px-4 py-1.5 rounded-full transition">Share Review</button>
          </div>

          <!-- EVALUATION TEXT -->
          <p class="italic text-sm text-text-muted" v-if="getCurrentReview.user_cefr_level">
            {{ getCurrentReview.user_cefr_level.reasons }}
          </p>

          <!-- DATE + METRICS -->
          <div class="flex flex-wrap gap-4 text-xs text-gray-500">
            <p><i class="fas fa-calendar-alt mr-1"></i> {{ formatDate(getCurrentReview.created_at) }}</p>
            <p><i class="fas fa-clock mr-1"></i> {{ formatDuration(getCurrentReview.history.duration_seconds) }}</p>
            <p><i class="fas fa-comments mr-1"></i> <b>Messages:</b> {{ getCurrentReview.history.messages.length - 2 }}</p>
            <p><i class="fas fa-user mr-1"></i> <b>You:</b> {{ getCurrentReview.history.user_utterances_count - 1 }}</p>
            <p><i class="fas fa-robot mr-1"></i> <b>AI:</b> {{ getCurrentReview.history.model_utterances_count }}</p>
          </div>

          <!-- SUGGESTIONS -->
          <div v-if="getCurrentReview.suggestion?.length" class="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
            <p class="font-semibold text-yellow-800 mb-2"><i class="fas fa-lightbulb mr-2"></i>Suggestion:</p>
            <ul class="list-disc list-inside text-sm text-yellow-900 space-y-1">
              <li v-for="(item, index) in getCurrentReview.suggestion" :key="index">
                {{ item }}
              </li>
            </ul>
          </div>

          <!-- CONCLUSION -->
          <div v-if="getCurrentReview.conclusion" class="bg-green-50 border-l-4 border-green-500 p-4 rounded-md">
            <p class="font-semibold text-green-800 mb-1"><i class="fas fa-check-circle mr-2"></i>Conclusion:</p>
            <p class="text-sm text-green-900">{{ getCurrentReview.conclusion }}</p>
          </div>

          <!-- CONSISTENCY REVIEW -->
          <div
            v-if="getCurrentReview.consistency_review"
            :class="{
              'bg-red-50 border-red-500 text-red-800': getCurrentReview.consistency_review.consistency_score < 40,
              'bg-yellow-50 border-yellow-500 text-yellow-800': getCurrentReview.consistency_review.consistency_score >= 40 && getCurrentReview.consistency_review.consistency_score < 70,
              'bg-green-50 border-green-500 text-green-800': getCurrentReview.consistency_review.consistency_score >= 70,
            }"
            class="border-l-4 p-4 rounded-md"
          >
            <p class="font-semibold mb-1"><i class="fas fa-balance-scale mr-2"></i>Consistency Review:</p>
            <p class="text-sm mb-2">{{ getCurrentReview.consistency_review.summary }}</p>

            <div v-if="getCurrentReview.consistency_review.inconsistent_turns.length > 0" class="mt-2">
              <p class="font-semibold text-sm mb-1">Inconsistencies:</p>
              <ul class="text-xs list-disc pl-5">
                <li v-for="(turn, index) in getCurrentReview.consistency_review.inconsistent_turns" :key="index">
                  <p><strong>Q:</strong> {{ turn.question }}</p>
                  <p><strong>A:</strong> {{ turn.user_response }}</p>
                  <p><strong>Comment:</strong> {{ turn.comment }}</p>
                </li>
              </ul>
            </div>
          </div>

          <div v-if="getCurrentReview.band_breakdown" class="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-md">
            <p class="font-semibold text-blue-800 mb-2"><i class="fas fa-chart-bar mr-2"></i>IELTS Band Breakdown:</p>
            <ul class="list-disc list-inside text-sm text-blue-900 space-y-1">
              <li><strong>Fluency & Coherence:</strong> {{ getCurrentReview.band_breakdown.fluency }}</li>
              <li><strong>Lexical Resource:</strong> {{ getCurrentReview.band_breakdown.lexical }}</li>
              <li><strong>Grammatical Range & Accuracy:</strong> {{ getCurrentReview.band_breakdown.grammar }}</li>
            </ul>
          </div>

          <div v-if="getCurrentReview.part1" class="bg-indigo-50 border-l-4 border-indigo-400 p-4 rounded-md">
            <p class="font-semibold text-indigo-800 mb-2"><i class="fas fa-comments mr-2"></i>IELTS Part 1 Feedback:</p>

            <p class="text-sm text-indigo-900 mb-2">
              {{ getCurrentReview.part1.summary }}
            </p>

            <div v-if="getCurrentReview.part1.highlights?.length">
              <p class="font-semibold text-indigo-800 text-sm mb-1">Highlights:</p>
              <ul class="list-disc list-inside text-sm text-indigo-900 space-y-1">
                <li v-for="(item, index) in getCurrentReview.part1.highlights" :key="index">
                  {{ item }}
                </li>
              </ul>
            </div>
          </div>

          <div v-if="getCurrentReview.part2" class="bg-purple-50 border-l-4 border-purple-400 p-4 rounded-md">
            <p class="font-semibold text-purple-800 mb-2"><i class="fas fa-microphone mr-2"></i>IELTS Part 2 Feedback:</p>

            <p class="text-sm text-purple-900 mb-2">
              {{ getCurrentReview.part2.summary }}
            </p>

            <div v-if="getCurrentReview.part2.highlights?.length">
              <p class="font-semibold text-purple-800 text-sm mb-1">Highlights:</p>
              <ul class="list-disc list-inside text-sm text-purple-900 space-y-1">
                <li v-for="(item, index) in getCurrentReview.part2.highlights" :key="index">
                  {{ item }}
                </li>
              </ul>
            </div>
          </div>

          <div v-if="getCurrentReview.part3" class="bg-pink-50 border-l-4 border-pink-400 p-4 rounded-md">
            <p class="font-semibold text-pink-800 mb-2"><i class="fas fa-chalkboard-teacher mr-2"></i>IELTS Part 3 Feedback:</p>

            <p class="text-sm text-pink-900 mb-2">
              {{ getCurrentReview.part3.summary }}
            </p>

            <div v-if="getCurrentReview.part3.highlights?.length">
              <p class="font-semibold text-pink-800 text-sm mb-1">Highlights:</p>
              <ul class="list-disc list-inside text-sm text-pink-900 space-y-1">
                <li v-for="(item, index) in getCurrentReview.part3.highlights" :key="index">
                  {{ item }}
                </li>
              </ul>
            </div>
          </div>

          <div v-if="getCurrentReview.goals_coverage?.length" class="mt-8">
            <h4 class="text-lg font-semibold text-text-base mb-4">User Goals</h4>
            <ul class="space-y-3">
              <li v-for="goal in getCurrentReview.goals_coverage" :key="goal.goal" class="text-sm">
                <div class="flex items-center gap-2">
                  <i :class="goal.is_covered ? 'fas fa-check text-green-600' : 'fas fa-times text-red-500'"></i>
                  <span class="font-medium">{{ goal.goal }}</span>
                </div>
                <div v-if="goal.quote_from_dialogue" class="ml-6 italic text-text-muted">
                  {{ goal.quote_from_dialogue }}
                </div>
              </li>
            </ul>
          </div>

          <div v-if="getCurrentReview.vocabulary_used?.length" class="mt-8">
            <h4 class="text-lg font-semibold text-text-base mb-4">Vocabulary Used</h4>
            <ul class="space-y-3">
              <li v-for="word in getCurrentReview.vocabulary_used" :key="word.word" class="text-sm">
                <div class="flex items-center gap-2">
                  <i :class="word.is_used ? 'fas fa-check text-green-600' : 'fas fa-times text-red-500'"></i>
                  <span class="font-medium">{{ word.word }}</span>
                  <span class="text-gray-500">— {{ word.is_used ? "Used" : "Not used" }}</span>
                </div>
                <div v-if="word.quote_from_dialogue" class="ml-6 italic text-text-muted">
                  {{ word.quote_from_dialogue }}
                </div>
              </li>
            </ul>
          </div>

          <div v-if="getCurrentReview.phrases_used?.length" class="mt-8">
            <h4 class="text-lg font-semibold text-text-base mb-4">Phrases Used</h4>
            <ul class="space-y-3">
              <li v-for="phrase in getCurrentReview.phrases_used" :key="phrase.phrase" class="text-sm">
                <div class="flex items-center gap-2">
                  <i :class="phrase.is_used ? 'fas fa-check text-green-600' : 'fas fa-times text-red-500'"></i>
                  <span class="font-medium">{{ phrase.phrase }}</span>
                  <span class="text-gray-500">— {{ phrase.is_used ? "Used" : "Not used" }}</span>
                </div>
                <div v-if="phrase.quote_from_dialogue" class="ml-6 italic text-text-muted">
                  {{ phrase.quote_from_dialogue }}
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div>
          <div class="flex justify-center mt-8 space-x-2">
            <button
              v-if="getCurrentReview?.error_analysis?.length"
              @click="activeTab = 'ERRORS'"
              :class="['px-4 py-2 rounded-full text-sm font-medium transition', activeTab === 'ERRORS' ? 'bg-primary text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200']"
            >
              Mistakes
            </button>

            <button
              @click="activeTab = 'DIALOGUE'"
              :class="['px-4 py-2 rounded-full text-sm font-medium transition', activeTab === 'DIALOGUE' ? 'bg-primary text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200']"
            >
              Conversation
            </button>

            <button
              v-if="issueTopics.length"
              @click="activeTab = 'TASKS'"
              :class="['px-4 py-2 rounded-full text-sm font-medium transition', activeTab === 'TASKS' ? 'bg-primary text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200']"
            >
              Tasks
            </button>
          </div>

          <div class="mt-8 bg-stone-50 rounded-2xl p-6 border border-stone-200 shadow-sm space-y-6">
            <div v-if="activeTab === 'ERRORS' && getCurrentReview.error_analysis?.length" class="space-y-10">
              <h2 class="text-2xl font-bold text-text-base">Mistakes Summary</h2>

              <ul class="space-y-8">
                <li v-for="(analysis, index) in getCurrentReview.error_analysis" :key="index" class="rounded-xl bg-white border border-gray-200 p-6 shadow-sm space-y-6">
                  <!-- User Message -->
                  <div class="bg-gray-50 p-4 rounded-md border-l-4 border-red-500">
                    <h3 class="text-sm text-gray-500 mb-1">User Message</h3>
                    <p class="text-md font-medium text-gray-800 leading-relaxed">{{ analysis.last_user_message }}</p>
                  </div>

                  <!-- Issues -->
                  <ul class="space-y-5">
                    <li v-for="(issue, i) in analysis.issues" :key="i" class="bg-gray-50 rounded-lg p-4 border border-gray-100">
                      <div class="text-sm space-y-1 leading-relaxed">
                        <p>
                          <span class="font-semibold text-gray-600">Original:</span>
                          <span class="ml-1" v-html="highlightWords(issue.original_text, issue.error_words, 'error')" />
                        </p>
                        <p>
                          <span class="font-semibold text-gray-600">Suggestion:</span>
                          <span class="ml-1" v-html="highlightWords(issue.corrected_text, issue.corrected_words, 'correct')" />
                        </p>
                        <p class="text-gray-700"><span class="font-semibold">Explanation:</span> {{ issue.explanation }}</p>
                        <p v-if="issue.topic_titles" class="text-gray-600"><span class="font-semibold">Topic:</span> {{ issue.topic_titles.join(", ") }}</p>
                      </div>
                    </li>
                  </ul>

                  <!-- Improvement -->
                  <div class="bg-green-50 border border-green-200 rounded-lg p-5 space-y-2 text-sm text-gray-800">
                    <h4 class="font-semibold text-text-base">How to improve?</h4>
                    <p><span class="font-semibold">Improved Answer:</span> {{ analysis.improve_user_answer.corrected_text }}</p>
                    <p><span class="font-semibold">CEFR Level:</span> {{ analysis.improve_user_answer.cefr_level }}</p>
                    <p><span class="font-semibold">Explanation:</span> {{ analysis.improve_user_answer.explanation }}</p>
                  </div>
                </li>
              </ul>
            </div>

            <div v-else-if="activeTab === 'DIALOGUE' && getCurrentReview.history?.messages?.length" class="space-y-8">
              <h2 class="text-2xl font-bold text-text-base">Conversation</h2>

              <ul class="space-y-4">
                <li
                  v-for="(msg, index) in getCurrentReview.history.messages.slice(2)"
                  :key="index"
                  :class="['rounded-xl p-4 max-w-[85%] shadow-sm', msg.role === 'user' ? 'bg-blue-50 ml-auto' : 'bg-green-50 mr-auto']"
                >
                  <!-- Header -->
                  <div class="flex items-center justify-between mb-2 text-sm text-gray-500">
                    <div class="flex items-center gap-1">
                      <i :class="msg.role === 'user' ? 'fas fa-user' : 'fas fa-robot'"></i>
                      <span>{{ msg.role === "user" ? "You" : "AI" }}</span>
                    </div>
                    <span><i class="fas fa-calendar-alt mr-1"></i>{{ formatDate(msg.created_at) }}</span>
                  </div>

                  <!-- Message Content -->
                  <p class="text-gray-800 text-sm leading-relaxed">{{ msg.content }}</p>

                  <!-- Audio -->
                  <audio v-if="msg.audio_url" class="w-full mt-3 rounded-md" preload="none" :src="msg.audio_url" @error="(e) => handleAudioError(e, msg)" controls />
                </li>
              </ul>
            </div>

            <div v-else-if="activeTab === 'TASKS'" class="space-y-10">
              <TheTask />

              <div class="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
                <label for="task-select" class="block font-medium text-gray-700 mb-2">Select topic:</label>
                <div class="flex gap-3">
                  <select id="task-select" v-model="selectedTopic" class="flex-1 border border-gray-300 rounded-md px-4 py-2 text-gray-700">
                    <option v-for="topic in issueTopics" :key="topic" :value="topic">
                      {{ topic }}
                    </option>
                  </select>
                  <button class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primaryDark transition" @click="generateTask">
                    {{ isLoading ? "Loading..." : "Generate Task" }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="px-6 py-10" v-else>
        <h1 class="text-3xl font-bold text-text-base mb-8">Conversation History</h1>

        <div v-if="getReviewsList.length" class="space-y-6">
          <div
            v-for="review in getReviewsList"
            :key="review._id"
            @click="openDetails(review)"
            class="bg-stone-50 hover:bg-stone-100 transition-colors duration-200 rounded-xl p-6 border border-stone-200 shadow-sm cursor-pointer relative"
          >
            <div class="flex items-start justify-between gap-4">
              <div class="flex-1">
                <h2 class="text-lg font-semibold text-gray-800 mb-2">
                  {{ review.topic_title }}
                </h2>

                <div class="flex items-center gap-2 mb-3">
                  <span class="bg-gray-200 text-xs text-gray-800 px-2 py-0.5 rounded-full">
                    {{ review.target_language }}
                  </span>
                  <!-- IELTS or CEFR tag -->
                  <span v-if="review.user_ielts_mark" class="bg-blue-100 text-xs text-blue-800 font-semibold px-2 py-0.5 rounded-full">
                    IELTS: {{ review.user_ielts_mark.toFixed(1).replace(".", ",") }}
                  </span>
                  <span v-else class="bg-green-100 text-xs text-green-800 font-medium px-2 py-0.5 rounded-full">
                    {{ review.user_cefr_level?.level }}
                  </span>
                </div>

                <p class="text-sm italic text-text-muted mb-3" v-if="review.user_cefr_level">
                  {{ review.user_cefr_level.reasons }}
                </p>

                <p class="text-sm italic text-text-muted mb-3" v-if="review?.conclusion">
                  {{ review.conclusion }}
                </p>

                <div class="flex flex-wrap gap-4 text-xs text-gray-500">
                  <p><i class="fas fa-calendar-alt mr-1"></i> {{ formatDate(review.created_at) }}</p>
                  <p><i class="fas fa-clock mr-1"></i> {{ formatDuration(review.history.duration_seconds) }}</p>
                  <p><i class="fas fa-comments mr-1"></i> Messages: {{ review.history.messages.length - 2 }}</p>
                </div>
              </div>

              <div class="flex flex-col gap-2 items-center justify-start">
                <button @click.prevent.stop="openDetails(review)" title="View" class="text-gray-600 hover:text-primary transition-colors">
                  <i class="fas fa-eye text-lg"></i>
                </button>
                <button @click.prevent.stop="deleteReview(review._id)" title="Delete" class="text-gray-600 hover:text-red-600 transition-colors">
                  <i class="fas fa-trash-alt text-lg"></i>
                </button>
              </div>
            </div>
          </div>

          <div ref="loadMoreTrigger" class="h-1" />
        </div>

        <p v-else class="text-center text-text-muted text-sm italic">You don't have any conversation reviews yet.</p>
      </div>
    </div>

    <v-modal v-model="isDeleteModalOpen">
      <TheConfirmation title="Delete Review" description="Are you sure you want to delete review? This action cannot be undone." @accept="confirmDeleteReview" @cancel="isDeleteModalOpen = false" />
    </v-modal>

    <v-modal v-model="isPublicLinkModalOpen">
      <PublicLink :public-id="getCurrentReview?.public_id ?? ''" @close="isPublicLinkModalOpen = false" />
    </v-modal>
  </div>
</template>

<script lang="ts">
import { defineComponent, onBeforeMount, computed, ref, onBeforeUnmount, nextTick, onMounted } from "vue"
import { useRoute, useRouter } from "vue-router"
import { commonStore, communicationReviewStore, orgStore, promptStore, taskGeneratorStore, userStore } from "@/app"
import { formatDuration, formatDate, highlightWords } from "@/shared/lib"
import { IConversationHistory, ICommunicationReview, TaskModeEnum, TaskTypeEnum } from "@/shared/types"
import { TheLoader, TheTask, TheConfirmation } from "@/shared/components"
import { PublicLink } from "./ui"

export default defineComponent({
  components: {
    TheLoader,
    TheTask,
    TheConfirmation,
    PublicLink,
  },

  setup() {
    const route = useRoute()
    const router = useRouter()
    const loadMoreTrigger = ref<HTMLElement | null>(null)
    const observer = ref<IntersectionObserver | null>(null)
    const controller = new AbortController()
    const isReady = ref<boolean>(false)
    const isLoading = ref<boolean>(false)
    const activeTab = ref<"ERRORS" | "DIALOGUE" | "TASKS">("ERRORS")
    const selectedTopic = ref<string>("")
    const isDeleteModalOpen = ref<boolean>(false)
    const selectedReviewId = ref<string>("")
    const isPublicLinkModalOpen = ref<boolean>(false)

    const getIsPageLoading = computed(() => commonStore.getIsPageLoading)
    const isSingle = computed(() => !!route.params.id)
    const getReviewsList = computed(() => communicationReviewStore.getReviewsList)
    const getCurrentReview = computed(() => communicationReviewStore.getCurrentReview)
    const getSelectedPrompt = computed(() => promptStore.getCurrentPrompt)
    const getReviewsParams = computed(() => communicationReviewStore.getReviewsParams)
    const getUserTranslateLanguage = computed(() => userStore.getCurrentUser?.explanation_language || "en")
    const getCurrentUser = computed(() => userStore.getCurrentUser)
    const issueTopics = computed(() => {
      if (!getCurrentReview.value) return []

      const topics = getCurrentReview.value.error_analysis
        .flatMap((item) => item.issues?.map((issue) => issue?.topic_titles) || [])
        .filter(Boolean)
        .flat()

      return [...new Set(topics)]
    })

    onBeforeMount(() => {
      if (!getCurrentReview.value) {
        router.push({
          name: "platform.history",
        })
      }

      isReady.value = true
    })

    onMounted(() => {
      observer.value = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && getReviewsParams.value.hasMore) {
          communicationReviewStore.fetchReviewsList(true)
        }
      })

      if (loadMoreTrigger.value) {
        observer.value.observe(loadMoreTrigger.value)
      }
    })

    const deleteReview = (id: string) => {
      selectedReviewId.value = id
      isDeleteModalOpen.value = true
    }

    const confirmDeleteReview = async () => {
      try {
        await communicationReviewStore.fetchDeleteReviewById(selectedReviewId.value)
      } catch (error) {
        console.error("Error deleting review:", error)
      } finally {
        isDeleteModalOpen.value = false
      }
    }

    const openDetails = async (review: ICommunicationReview) => {
      communicationReviewStore.setCurrentReview(review)

      await taskGeneratorStore.fetchTasksByReviewId(review._id).catch((error: unknown) => console.log(error))

      selectedTopic.value = issueTopics.value?.[0] ?? ""
      activeTab.value = getCurrentReview.value?.error_analysis?.length ? "ERRORS" : "DIALOGUE"

      router.push({
        name: "platform.history",
        params: { id: review._id },
      })
    }

    const generateTask = async () => {
      if (!getCurrentReview.value || isLoading.value || !selectedTopic.value) return

      try {
        isLoading.value = true

        window.dataLayer = window.dataLayer || []
        window.dataLayer.push({
          event: "TASK_GENERATED",
          scenario_name: getSelectedPrompt.value.name,
          scenario_id: getSelectedPrompt.value._id,
          user_id: getCurrentUser.value?._id,
        })

        if (!Object.keys(getSelectedPrompt.value).length) {
          await promptStore.fetchPromptById(getCurrentReview.value.prompt_id)
        }

        await taskGeneratorStore.fetchTaskGenerator(
          {
            review_id: getCurrentReview.value._id,
            topic_title: selectedTopic.value,
            type: TaskTypeEnum.MULTIPLE_CHOICE,
            mode: TaskModeEnum.WRITE,
            target_language: getSelectedPrompt.value?.meta?.target_language || "",
            explanation_language: getUserTranslateLanguage.value,
            task_sentences_count: 10,
          },
          controller.signal
        )

        orgStore.updateTrialUsage("task")
      } catch (error: unknown) {
        console.log(error)
      } finally {
        isLoading.value = false
      }
    }

    const handleAudioError = async (e: Event, msg: IConversationHistory) => {
      const target = e.target as HTMLAudioElement
      const is403 = target?.error?.code === target?.error?.MEDIA_ERR_SRC_NOT_SUPPORTED

      if (is403 && getCurrentReview.value) {
        try {
          await communicationReviewStore.fetchUpdateAudioUrl({
            id: getCurrentReview.value._id,
            session_id: getCurrentReview.value.session_id,
            pair_id: msg.pair_id,
            role: msg.role,
          })

          nextTick(() => {
            target.load()
            target.play().catch((err) => {
              console.warn("Auto-play blocked or failed:", err)
            })
          })
        } catch (err) {
          console.error("Failed to refresh audio URL", err)
        }
      }
    }

    const generatePublicLink = async () => {
      if (!getCurrentReview.value) return

      if (getCurrentReview.value?.public_id) {
        isPublicLinkModalOpen.value = true
        return
      }

      try {
        await communicationReviewStore.generateReviewPublicId(getCurrentReview.value._id)

        isPublicLinkModalOpen.value = true
      } catch (error: unknown) {
        console.log(error)
      }
    }

    onBeforeUnmount(() => {
      controller.abort()
      observer.value?.disconnect()
    })

    return {
      isReady,
      isSingle,
      isDeleteModalOpen,
      activeTab,
      loadMoreTrigger,
      isLoading,
      selectedTopic,
      isPublicLinkModalOpen,
      getReviewsList,
      getCurrentReview,
      issueTopics,
      getIsPageLoading,
      formatDate,
      formatDuration,
      openDetails,
      deleteReview,
      confirmDeleteReview,
      highlightWords,
      generateTask,
      handleAudioError,
      generatePublicLink,
      TaskTypeEnum,
    }
  },
})
</script>
