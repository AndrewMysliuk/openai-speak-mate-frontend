<template>
  <div class="flex-grow min-h-0">
    <TheLoader v-if="!isReady" />

    <div class="pt-16" v-else>
      <div class="px-6 py-10">
        <h1 class="text-3xl font-bold text-text-base mb-6">Progress</h1>

        <div class="bg-stone-50 rounded-2xl p-6 border border-stone-200 shadow-sm space-y-6">
          <ProgressOverview />
        </div>

        <div class="mt-4 bg-stone-50 rounded-2xl p-6 border border-stone-200 shadow-sm space-y-6">
          <DayStreakProgress />
        </div>

        <div class="mt-4 bg-stone-50 rounded-2xl p-6 border border-stone-200 shadow-sm space-y-6">
          <CefrProgressChart />
        </div>

        <div class="mt-4 bg-stone-50 rounded-2xl p-6 border border-stone-200 shadow-sm flex flex-col gap-6 md:flex-row md:gap-4">
          <ErrorStatsList />

          <CompletedPromptsList />
        </div>

        <div class="mt-4 bg-stone-50 rounded-2xl p-6 border border-stone-200 shadow-sm space-y-6">
          <TasksTimeline />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref, onBeforeMount } from "vue"
import { userProgressStore } from "@/app"
import { TheLoader } from "@/shared/components"
import { ProgressOverview, CefrProgressChart, ErrorStatsList, CompletedPromptsList, TasksTimeline, DayStreakProgress } from "./ui"

export default defineComponent({
  components: {
    TheLoader,
    ProgressOverview,
    CefrProgressChart,
    ErrorStatsList,
    CompletedPromptsList,
    TasksTimeline,
    DayStreakProgress,
  },

  setup() {
    const isReady = ref<boolean>(false)

    const getCurrentUserProgress = computed(() => userProgressStore.getCurrentUserProgress)

    onBeforeMount(async () => {
      await fetchUserProgress()

      isReady.value = true
    })

    const fetchUserProgress = async () => {
      try {
        await userProgressStore.fetchCurrentUserProgress()
      } catch (error: unknown) {
        console.error("Error fetching user progress:", error)
      }
    }

    return {
      isReady,
      getCurrentUserProgress,
    }
  },
})
</script>
