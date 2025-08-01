<template>
  <div class="space-y-6">
    <div
      v-for="(scenario, index) in getIeltsScenarioList"
      :key="scenario._id"
      @click="selectPrompt(scenario)"
      class="relative bg-white border-l-4 rounded-2xl p-6 border border-gray-200 shadow-sm transition-all duration-200 cursor-pointer hover:shadow-md hover:-translate-y-[1px]"
      :class="[
        scenario.level === 'A1'
          ? 'border-l-sky-200'
          : scenario.level === 'A2'
            ? 'border-l-blue-200'
            : scenario.level === 'B1'
              ? 'border-l-indigo-200'
              : scenario.level === 'B2'
                ? 'border-l-violet-200'
                : scenario.level === 'C1'
                  ? 'border-l-purple-200'
                  : scenario.level === 'C2'
                    ? 'border-l-rose-200'
                    : 'border-l-gray-200',
      ]"
    >
      <!-- Header -->
      <div :class="['flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2', currentIeltsPart === null ? 'mb-2' : 'sm:mb-2 mb-1']">
        <h3 class="text-xl font-semibold text-gray-900 truncate">
          {{
            currentIeltsPart === SessionIeltsPartEnum.PART_1
              ? scenario.model_behavior.ielts_scenario?.part1.topics?.map((t) => t.title).join(", ")
              : currentIeltsPart === SessionIeltsPartEnum.PART_2
                ? scenario.model_behavior.ielts_scenario?.part2.title
                : currentIeltsPart === SessionIeltsPartEnum.PART_3
                  ? scenario.model_behavior.ielts_scenario?.part3.topics?.map((t) => t.title).join(", ")
                  : scenario.title
          }}
        </h3>

        <!-- Unified badge -->
        <div class="w-fit mb-2">
          <span
            :class="[
              'text-xs font-medium px-3 py-1 rounded-full border inline-block',
              getPartProgress(getCurrentUserProgress, scenario.name, currentIeltsPart || 'FULL_SCENARIO')
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-gray-100 text-gray-700 border-gray-200',
            ]"
          >
            {{ scenario.level }} ·
            <span v-if="getPartProgress(getCurrentUserProgress, scenario.name, currentIeltsPart || 'FULL_SCENARIO')">
              Completed {{ getPartProgress(getCurrentUserProgress, scenario.name, currentIeltsPart || "FULL_SCENARIO") }}x
            </span>
            <span v-else> Not completed </span>
          </span>
        </div>
      </div>

      <!-- Description (only if no part selected) -->
      <p v-if="currentIeltsPart === null" class="text-sm text-gray-600 mb-4 line-clamp-3 sm:w-4/5">
        {{ scenario.description }}
      </p>

      <!-- Show Details -->
      <div class="text-right sm:flex sm:justify-end">
        <button
          @click.prevent.stop="toggleExpand(index)"
          class="text-sm text-primary font-medium inline-flex items-center gap-1 group"
          v-if="scenario.user_content.goals?.length || scenario.user_content.dictionary?.length || scenario.user_content.phrases?.length"
        >
          <i :class="expandedScenario === index ? 'fas fa-chevron-up' : 'fas fa-chevron-down'" class="text-base" />
          <span class="sm:group-hover:underline">
            {{ expandedScenario === index ? "Hide Details" : "Show Details" }}
          </span>
        </button>
      </div>

      <!-- Expanded content -->
      <transition name="fade">
        <div v-if="expandedScenario === index" class="mt-4 border-t pt-4 space-y-4">
          <!-- Goals -->
          <div v-if="scenario.user_content.goals?.length">
            <h4 class="text-sm font-semibold text-gray-800 mb-1.5 flex items-center gap-2">
              <i class="fas fa-bullseye text-gray-500" />
              Goals
            </h4>
            <ul class="text-sm text-gray-700 leading-relaxed space-y-1.5 pl-4 list-disc">
              <li v-for="goal in scenario.user_content.goals" :key="goal.phrase">
                <b>{{ goal.phrase }}</b> — <i class="text-gray-600">{{ goal.translation[getUserTranslateLanguage] }}</i>
              </li>
            </ul>
          </div>

          <!-- Dictionary -->
          <div v-if="scenario.user_content.dictionary?.length">
            <h4 class="text-sm font-semibold text-gray-800 mb-1.5 flex items-center gap-2">
              <i class="fas fa-book text-gray-500" />
              Dictionary
            </h4>
            <ul class="text-sm text-gray-700 leading-relaxed space-y-1.5 pl-4 list-disc">
              <li v-for="word in scenario.user_content.dictionary" :key="word.word">
                <b>{{ word.word }}</b> <span class="text-gray-500">({{ word.translation[getUserTranslateLanguage] }})</span> — {{ word.meaning }}
              </li>
            </ul>
          </div>

          <!-- Phrases -->
          <div v-if="scenario.user_content.phrases?.length">
            <h4 class="text-sm font-semibold text-gray-800 mb-1.5 flex items-center gap-2">
              <i class="fas fa-comment-dots text-gray-500" />
              Phrases
            </h4>
            <ul class="text-sm text-gray-700 leading-relaxed space-y-1.5 pl-4 list-disc">
              <li v-for="phrase in scenario.user_content.phrases" :key="phrase.phrase">
                <b>"{{ phrase.phrase }}"</b> — <i class="text-gray-600">{{ phrase.translation[getUserTranslateLanguage] }}</i>
              </li>
            </ul>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from "vue"
import { promptStore, userProgressStore, userStore } from "@/app"
import { IPromptScenarioEntity, SessionIeltsPartEnum } from "@/shared/types"
import { getPartProgress } from "@/shared/lib"
import { urlAudioPlayer } from "@/app"

export default defineComponent({
  props: {
    currentIeltsPart: {
      type: [String, Number] as PropType<SessionIeltsPartEnum | null>,
      default: null,
    },

    expandedScenario: {
      type: [String, Number, null],
      default: "",
    },
  },

  setup(props, { emit }) {
    const getIeltsScenarioList = computed(() => promptStore.getIeltsScenarioList)
    const getUserTranslateLanguage = computed(() => userStore.getCurrentUser?.explanation_language || "en")
    const getCurrentUserProgress = computed(() => userProgressStore.getCurrentUserProgress?.completed_prompts ?? {})

    const selectPrompt = (prompt: IPromptScenarioEntity) => {
      urlAudioPlayer.unlockAudio()
      emit("selectPrompt", { ...prompt, meta: { ...prompt.meta, active_ielts_part: props.currentIeltsPart ? props.currentIeltsPart : undefined } })
    }

    const toggleExpand = (index: number | string) => {
      emit("toggleExpand", index)
    }

    return {
      getIeltsScenarioList,
      getUserTranslateLanguage,
      getCurrentUserProgress,
      selectPrompt,
      toggleExpand,
      getPartProgress,
      SessionIeltsPartEnum,
    }
  },
})
</script>
