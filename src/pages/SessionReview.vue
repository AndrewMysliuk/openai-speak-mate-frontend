<template>
  <div class="bg-gray-50">
    <TheLoader v-if="!isReady" />

    <div v-else>
      <div class="py-10 px-6" v-if="getPublicReview">
        <h1 class="text-3xl font-bold text-text-base mb-6">
          {{ getPublicReview.topic_title }}
        </h1>

        <div class="mt-8 bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-6">
          <nav class="flex gap-2 relative overflow-x-auto no-scrollbar after:absolute after:bottom-0 after:inset-x-0 after:border-b after:border-stone-200 sm:flex-nowrap">
            <button
              @click="activeTab = CommunicationReviewHistoryEnum.GENERAL"
              type="button"
              :class="[
                'flex-shrink-0 px-3 py-1 sm:px-4 sm:py-2 text-sm sm:text-base mb-2 relative inline-flex justify-center items-center gap-x-1 sm:gap-x-2 rounded-lg focus:outline-none after:absolute after:-bottom-2 after:inset-x-0 after:z-10 after:h-0.5 after:pointer-events-none',
                activeTab === CommunicationReviewHistoryEnum.GENERAL ? 'text-stone-800 after:bg-stone-800' : 'text-stone-500 hover:bg-stone-100 hover:text-stone-800',
              ]"
            >
              Summary
            </button>

            <button
              v-if="getPublicReview?.error_analysis?.length"
              @click="activeTab = CommunicationReviewHistoryEnum.ERRORS"
              type="button"
              :class="[
                'flex-shrink-0 px-3 py-1 sm:px-4 sm:py-2 text-sm sm:text-base mb-2 relative inline-flex justify-center items-center gap-x-1 sm:gap-x-2 rounded-lg focus:outline-none after:absolute after:-bottom-2 after:inset-x-0 after:z-10 after:h-0.5 after:pointer-events-none',
                activeTab === CommunicationReviewHistoryEnum.ERRORS ? 'text-stone-800 after:bg-stone-800' : 'text-stone-500 hover:bg-stone-100 hover:text-stone-800',
              ]"
            >
              Mistakes
            </button>
          </nav>

          <div v-if="activeTab === CommunicationReviewHistoryEnum.GENERAL" class="space-y-10">
            <h2 class="text-2xl font-bold text-gray-800">General Summary</h2>

            <div class="space-y-6">
              <!-- TAGS + SHARE BUTTON -->
              <div class="flex flex-wrap items-center gap-3 text-gray-600">
                <span class="px-3 py-1 bg-purple-100 text-purple-800 text-base font-semibold rounded-md">
                  {{ getPublicReview.target_language }}
                </span>

                <span v-if="getPublicReview.user_ielts_mark" class="px-3 py-1 bg-blue-100 text-blue-800 text-base font-semibold rounded-md">
                  IELTS: {{ getPublicReview.user_ielts_mark.toFixed(1).replace(".", ",") }}
                </span>

                <span v-else-if="getPublicReview.user_cefr_level" class="px-3 py-1 bg-green-100 text-green-800 text-base font-semibold rounded-md">
                  {{ getPublicReview.user_cefr_level.level }}
                </span>
              </div>

              <!-- CEFR Grammar Evaluation -->
              <p v-if="getPublicReview.user_cefr_level" class="italic text-base text-gray-500 mt-3">
                {{ getPublicReview.user_cefr_level.reasons }}
              </p>

              <!-- Metadata: Date, Time, Messages -->
              <div class="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500 mt-4">
                <p><i class="fas fa-calendar-alt mr-1"></i> {{ formatDate(getPublicReview.created_at) }}</p>
                <p><i class="fas fa-clock mr-1"></i> {{ formatDuration(getPublicReview.history.duration_seconds) }}</p>
                <p><i class="fas fa-comments mr-1"></i> <b>Messages:</b> {{ getPublicReview.history.messages.length - 2 }}</p>
                <p><i class="fas fa-user mr-1"></i> <b>You:</b> {{ getPublicReview.history.user_utterances_count - 1 }}</p>
                <p><i class="fas fa-robot mr-1"></i> <b>AI:</b> {{ getPublicReview.history.model_utterances_count }}</p>
              </div>

              <!-- SUGGESTIONS -->
              <div v-if="getPublicReview.suggestion?.length" class="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
                <p class="font-semibold text-yellow-800 mb-2"><i class="fas fa-lightbulb mr-2"></i>Suggestion:</p>
                <ul class="list-disc list-inside text-sm text-yellow-900 space-y-1">
                  <li v-for="(item, index) in getPublicReview.suggestion" :key="index">
                    {{ item }}
                  </li>
                </ul>
              </div>

              <!-- CONCLUSION -->
              <div v-if="getPublicReview.conclusion" class="bg-green-50 border-l-4 border-green-500 p-4 rounded-md">
                <p class="font-semibold text-green-800 mb-1"><i class="fas fa-check-circle mr-2"></i>Conclusion:</p>
                <p class="text-sm text-green-900">{{ getPublicReview.conclusion }}</p>
              </div>

              <!-- CONSISTENCY REVIEW -->
              <div
                v-if="getPublicReview.consistency_review"
                :class="{
                  'bg-red-50 border-red-500 text-red-800': getPublicReview.consistency_review.consistency_score < 40,
                  'bg-yellow-50 border-yellow-500 text-yellow-800': getPublicReview.consistency_review.consistency_score >= 40 && getPublicReview.consistency_review.consistency_score < 70,
                  'bg-green-50 border-green-500 text-green-800': getPublicReview.consistency_review.consistency_score >= 70,
                }"
                class="border-l-4 p-4 rounded-md"
              >
                <p class="font-semibold mb-1"><i class="fas fa-balance-scale mr-2"></i>Consistency Review:</p>
                <p class="text-sm mb-2">{{ getPublicReview.consistency_review.summary }}</p>

                <div v-if="getPublicReview.consistency_review.inconsistent_turns.length > 0" class="mt-2">
                  <p class="font-semibold text-sm mb-2">Inconsistencies:</p>
                  <ul class="text-sm list-disc pl-5">
                    <li v-for="(turn, index) in getPublicReview.consistency_review.inconsistent_turns" :key="index">
                      <p><strong>Q:</strong> {{ turn.question }}</p>
                      <p><strong>A:</strong> {{ turn.user_response }}</p>
                      <p><strong>Comment:</strong> {{ turn.comment }}</p>
                    </li>
                  </ul>
                </div>
              </div>

              <div v-if="getPublicReview.band_breakdown" class="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-md">
                <p class="font-semibold text-blue-800 mb-2"><i class="fas fa-chart-bar mr-2"></i>IELTS Band Breakdown:</p>
                <ul class="list-disc list-inside text-sm text-blue-900 space-y-1">
                  <li><strong>Fluency & Coherence:</strong> {{ getPublicReview.band_breakdown.fluency }}</li>
                  <li><strong>Lexical Resource:</strong> {{ getPublicReview.band_breakdown.lexical }}</li>
                  <li><strong>Grammatical Range & Accuracy:</strong> {{ getPublicReview.band_breakdown.grammar }}</li>
                </ul>
              </div>

              <div v-if="getPublicReview.part1" class="bg-indigo-50 border-l-4 border-indigo-400 p-4 rounded-md">
                <p class="font-semibold text-indigo-800 mb-2"><i class="fas fa-comments mr-2"></i>IELTS Part 1 Feedback:</p>

                <p class="text-sm text-indigo-900 mb-2">
                  {{ getPublicReview.part1.summary }}
                </p>

                <div v-if="getPublicReview.part1.highlights?.length">
                  <p class="font-semibold text-indigo-800 text-sm mb-1">Highlights:</p>
                  <ul class="list-disc list-inside text-sm text-indigo-900 space-y-1">
                    <li v-for="(item, index) in getPublicReview.part1.highlights" :key="index">
                      {{ item }}
                    </li>
                  </ul>
                </div>
              </div>

              <div v-if="getPublicReview.part2" class="bg-purple-50 border-l-4 border-purple-400 p-4 rounded-md">
                <p class="font-semibold text-purple-800 mb-2"><i class="fas fa-microphone mr-2"></i>IELTS Part 2 Feedback:</p>

                <p class="text-sm text-purple-900 mb-2">
                  {{ getPublicReview.part2.summary }}
                </p>

                <div v-if="getPublicReview.part2.highlights?.length">
                  <p class="font-semibold text-purple-800 text-sm mb-1">Highlights:</p>
                  <ul class="list-disc list-inside text-sm text-purple-900 space-y-1">
                    <li v-for="(item, index) in getPublicReview.part2.highlights" :key="index">
                      {{ item }}
                    </li>
                  </ul>
                </div>
              </div>

              <div v-if="getPublicReview.part3" class="bg-pink-50 border-l-4 border-pink-400 p-4 rounded-md">
                <p class="font-semibold text-pink-800 mb-2"><i class="fas fa-chalkboard-teacher mr-2"></i>IELTS Part 3 Feedback:</p>

                <p class="text-sm text-pink-900 mb-2">
                  {{ getPublicReview.part3.summary }}
                </p>

                <div v-if="getPublicReview.part3.highlights?.length">
                  <p class="font-semibold text-pink-800 text-sm mb-1">Highlights:</p>
                  <ul class="list-disc list-inside text-sm text-pink-900 space-y-1">
                    <li v-for="(item, index) in getPublicReview.part3.highlights" :key="index">
                      {{ item }}
                    </li>
                  </ul>
                </div>
              </div>

              <div v-if="getPublicReview.goals_coverage?.length" class="mt-8">
                <h4 class="text-lg font-semibold text-gray-800 mb-3">User Goals</h4>
                <ul class="space-y-2">
                  <li v-for="goal in getPublicReview.goals_coverage" :key="goal.goal" class="text-sm leading-relaxed">
                    <div class="flex items-center gap-2 text-gray-800">
                      <i :class="goal.is_covered ? 'fas fa-check text-green-600' : 'fas fa-times text-red-500'"></i>
                      <span class="font-medium">{{ goal.goal }}</span>
                    </div>
                    <div class="ml-6 mt-1 text-sm italic text-gray-500">"{{ goal.quote_from_dialogue || "-" }}"</div>
                  </li>
                </ul>
              </div>

              <div v-if="getPublicReview.vocabulary_used?.length" class="mt-8">
                <h4 class="text-lg font-semibold text-gray-800 mb-3">Vocabulary Used</h4>
                <ul class="space-y-2">
                  <li v-for="word in getPublicReview.vocabulary_used" :key="word.word" class="text-sm leading-relaxed">
                    <div class="flex items-center gap-2 text-gray-800">
                      <i :class="word.is_used ? 'fas fa-check text-green-600' : 'fas fa-times text-red-500'"></i>
                      <span class="font-medium">{{ word.word }}</span>
                      <span class="text-gray-500">— {{ word.is_used ? "Used" : "Not used" }}</span>
                    </div>
                    <div class="ml-6 mt-1 text-sm italic text-gray-500">"{{ word.quote_from_dialogue || "-" }}"</div>
                  </li>
                </ul>
              </div>

              <div v-if="getPublicReview.phrases_used?.length" class="mt-8">
                <h4 class="text-lg font-semibold text-gray-800 mb-3">Phrases Used</h4>
                <ul class="space-y-2">
                  <li v-for="phrase in getPublicReview.phrases_used" :key="phrase.phrase" class="text-sm leading-relaxed">
                    <div class="flex items-center gap-2 text-gray-800">
                      <i :class="phrase.is_used ? 'fas fa-check text-green-600' : 'fas fa-times text-red-500'"></i>
                      <span class="font-medium">{{ phrase.phrase }}</span>
                      <span class="text-gray-500">— {{ phrase.is_used ? "Used" : "Not used" }}</span>
                    </div>
                    <div class="ml-6 mt-1 text-sm italic text-gray-500">"{{ phrase.quote_from_dialogue || "-" }}"</div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div v-if="activeTab === CommunicationReviewHistoryEnum.ERRORS && getPublicReview.error_analysis?.length" class="space-y-10">
            <h2 class="text-2xl font-bold text-gray-800">Mistakes Summary</h2>

            <ul class="space-y-8">
              <li v-for="(analysis, index) in getPublicReview.error_analysis" :key="index" class="space-y-6 pb-8 border-b-2 border-gray-200 last:border-none">
                <!-- USER MESSAGE -->
                <div class="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h3 class="text-sm text-red-700 font-semibold mb-1 flex items-center gap-2"><i class="fas fa-user text-red-500"></i> User Message</h3>
                  <p class="text-base font-medium text-gray-800 leading-relaxed">
                    {{ analysis.last_user_message }}
                  </p>
                </div>

                <!-- ISSUES LIST -->
                <ul class="space-y-5">
                  <li v-for="(issue, i) in analysis.issues" :key="i" class="p-4 rounded-lg border border-gray-100 bg-gray-50 text-sm leading-relaxed space-y-2">
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
                  </li>
                </ul>

                <!-- IMPROVEMENT -->
                <div class="p-5 bg-green-50 border border-green-200 rounded-lg space-y-2 text-sm text-gray-800">
                  <h4 class="font-semibold text-green-700 flex items-center gap-2"><i class="fas fa-brain text-green-600"></i> How to improve?</h4>
                  <p><span class="font-semibold">Improved Answer:</span> {{ analysis.improve_user_answer.corrected_text }}</p>
                  <p><span class="font-semibold">CEFR Level:</span> {{ analysis.improve_user_answer.cefr_level }}</p>
                  <p><span class="font-semibold">Explanation:</span> {{ analysis.improve_user_answer.explanation }}</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onBeforeMount, ref } from "vue"
import { useRoute, useRouter } from "vue-router"
import { communicationReviewStore } from "@/app"
import { formatDuration, formatDate, highlightWords } from "@/shared/lib"
import { TheLoader } from "@/shared/components"
import { CommunicationReviewHistoryEnum } from "@/shared/types"

export default defineComponent({
  components: {
    TheLoader,
  },

  setup() {
    const route = useRoute()
    const router = useRouter()
    const isReady = ref<boolean>(false)
    const publicId = route.params.public_id as string | undefined
    const activeTab = ref<CommunicationReviewHistoryEnum>(CommunicationReviewHistoryEnum.GENERAL)

    if (!publicId) {
      router.replace({ name: "index" })
    }

    const getPublicReview = computed(() => communicationReviewStore.getPublicReview)

    onBeforeMount(async () => {
      await fetchPublicReview()

      isReady.value = true
    })

    const fetchPublicReview = async () => {
      try {
        if (!publicId) throw new Error("publicId is undefined")

        await communicationReviewStore.fetchReviewByPublicId(publicId)
      } catch (error: unknown) {
        console.log(error)

        router.replace({ name: "index" })
      }
    }

    return {
      isReady,
      activeTab,
      getPublicReview,
      formatDate,
      formatDuration,
      highlightWords,
      CommunicationReviewHistoryEnum,
    }
  },
})
</script>
