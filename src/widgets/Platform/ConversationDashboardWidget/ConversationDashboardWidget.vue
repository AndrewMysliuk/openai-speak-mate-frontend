<template>
  <div class="flex-grow min-h-0 bg-gray-50">
    <TheLoader v-if="getIsPageLoading || isLoading || !isReady" />

    <div class="pt-16 max-w-[1720px] w-full mx-auto" v-else>
      <div v-if="isOverview" class="px-6 py-10">
        <nav class="mb-6">
          <div class="flex items-center gap-4 sm:gap-6">
            <button
              type="button"
              @click="toggleTabs(PromptLibraryTabsEnum.MODULES)"
              :aria-selected="activeTab === PromptLibraryTabsEnum.MODULES"
              :class="['text-lg sm:text-[26px] font-semibold transition-all', activeTab === PromptLibraryTabsEnum.MODULES ? 'text-[#4F46E5]' : 'text-gray-500 hover:text-gray-700']"
            >
              Topics
            </button>

            <button
              type="button"
              @click="toggleTabs(PromptLibraryTabsEnum.SCENARIOS)"
              :aria-selected="activeTab === PromptLibraryTabsEnum.SCENARIOS"
              :class="['text-lg sm:text-[26px] font-semibold transition-all', activeTab === PromptLibraryTabsEnum.SCENARIOS ? 'text-[#4F46E5]' : 'text-gray-500 hover:text-gray-700']"
            >
              Scenarios
            </button>

            <button
              v-if="targetLanguage === 'English'"
              type="button"
              @click="toggleTabs(PromptLibraryTabsEnum.IELTS)"
              :aria-selected="activeTab === PromptLibraryTabsEnum.IELTS"
              :class="['text-lg sm:text-[26px] font-semibold transition-all', activeTab === PromptLibraryTabsEnum.IELTS ? 'text-[#4F46E5]' : 'text-gray-500 hover:text-gray-700']"
            >
              IELTS
            </button>
          </div>
        </nav>

        <div class="flex flex-col sm:flex-row sm:items-center gap-4 mb-6 w-full" v-if="activeTab !== PromptLibraryTabsEnum.IELTS">
          <TheCountryLanguage :model-value="targetLanguage" @update:modelValue="updateTargetLanguage" />

          <div class="flex-1 relative">
            <input
              :value="activeTab === PromptLibraryTabsEnum.MODULES ? searchQueryModules : searchQueryScenarios"
              @input="onSearchInput"
              type="text"
              placeholder="Search..."
              class="w-full border border-gray-300 rounded-md px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-0 focus:border-[#4F46E5] transition"
            />

            <button
              v-if="activeTab === PromptLibraryTabsEnum.MODULES ? searchQueryModules.length : searchQueryScenarios.length"
              @click="clearSearch"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 hover:text-gray-600 transition font-medium"
              title="Clear search"
              type="button"
            >
              Clear
            </button>
          </div>
        </div>

        <div class="w-full mb-6" v-else>
          <div class="flex justify-center w-full overflow-x-auto">
            <div class="flex gap-2 w-max sm:w-auto">
              <button
                @click="toggleIeltsPart(null)"
                type="button"
                :class="[
                  'py-2 px-4 text-sm sm:text-base rounded-full border transition whitespace-nowrap',
                  currentIeltsPart === null ? 'bg-[#4F46E5] text-white border-[#4F46E5]' : 'bg-white text-gray-800 border-gray-200 hover:border-[#4F46E5] focus:border-[#4F46E5]',
                ]"
              >
                Full Exam
              </button>

              <button
                @click="toggleIeltsPart(SessionIeltsPartEnum.PART_1)"
                type="button"
                :class="[
                  'py-2 px-4 text-sm sm:text-base rounded-full border transition whitespace-nowrap',
                  currentIeltsPart === SessionIeltsPartEnum.PART_1
                    ? 'bg-[#4F46E5] text-white border-[#4F46E5]'
                    : 'bg-white text-gray-800 border-gray-200 hover:border-[#4F46E5] focus:border-[#4F46E5]',
                ]"
              >
                Part 1
              </button>

              <button
                @click="toggleIeltsPart(SessionIeltsPartEnum.PART_2)"
                type="button"
                :class="[
                  'py-2 px-4 text-sm sm:text-base rounded-full border transition whitespace-nowrap',
                  currentIeltsPart === SessionIeltsPartEnum.PART_2
                    ? 'bg-[#4F46E5] text-white border-[#4F46E5]'
                    : 'bg-white text-gray-800 border-gray-200 hover:border-[#4F46E5] focus:border-[#4F46E5]',
                ]"
              >
                Part 2
              </button>

              <button
                @click="toggleIeltsPart(SessionIeltsPartEnum.PART_3)"
                type="button"
                :class="[
                  'py-2 px-4 text-sm sm:text-base rounded-full border transition whitespace-nowrap',
                  currentIeltsPart === SessionIeltsPartEnum.PART_3
                    ? 'bg-[#4F46E5] text-white border-[#4F46E5]'
                    : 'bg-white text-gray-800 border-gray-200 hover:border-[#4F46E5] focus:border-[#4F46E5]',
                ]"
              >
                Part 3
              </button>
            </div>
          </div>
        </div>

        <ModuleList v-if="activeTab === PromptLibraryTabsEnum.MODULES" @openScenarios="openScenarios" />

        <ScenarioList v-if="activeTab === PromptLibraryTabsEnum.SCENARIOS" :expanded-scenario="expandedScenario" @toggleExpand="toggleExpand" @selectPrompt="selectPrompt" />

        <IeltsScenarioList
          v-if="activeTab === PromptLibraryTabsEnum.IELTS"
          :current-ielts-part="currentIeltsPart"
          :expanded-scenario="expandedScenario"
          @toggleExpand="toggleExpand"
          @selectPrompt="selectPrompt"
        />

        <div ref="loadMoreTrigger" class="h-1" />

        <div v-if="isListLoading" class="text-center text-text-muted text-sm italic py-4">Loading more...</div>
      </div>

      <ModuleScenarioList :expanded-scenario="expandedScenario" @toggleExpand="toggleExpand" @selectPrompt="selectPrompt" @overview="isOverview = true" v-else />
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, nextTick, onBeforeMount, onBeforeUnmount, onMounted, ref } from "vue"
import { useRouter } from "vue-router"
import { commonStore, promptStore, userProgressStore, userStore } from "@/app"
import { TheLoader, TheCountryLanguage } from "@/shared/components"
import { IPromptScenarioEntity, SessionIeltsPartEnum } from "@/shared/types"
import { PromptLibraryTabsEnum } from "./types"
import { ModuleList, ScenarioList, ModuleScenarioList, IeltsScenarioList } from "./ui"

export default defineComponent({
  components: {
    TheLoader,
    TheCountryLanguage,
    ModuleList,
    ScenarioList,
    ModuleScenarioList,
    IeltsScenarioList,
  },

  setup() {
    const router = useRouter()
    const isReady = ref<boolean>(false)
    const isListLoading = ref<boolean>(false)
    const isLoading = ref<boolean>(false)
    const searchQueryModules = ref<string>("")
    const searchQueryScenarios = ref<string>("")
    const targetLanguage = ref<string>("English")
    const isOverview = ref<boolean>(true)
    const activeTab = ref<PromptLibraryTabsEnum>(PromptLibraryTabsEnum.MODULES)
    const expandedScenario = ref<string | number | null>(null)
    const loadMoreTrigger = ref<HTMLElement | null>(null)
    const observer = ref<IntersectionObserver | null>(null)
    const currentIeltsPart = ref<SessionIeltsPartEnum | null>(null)
    let debounceTimeout: ReturnType<typeof setTimeout> | null = null

    const getIsPageLoading = computed(() => commonStore.getIsPageLoading)

    const getCurrentPrompt = computed(() => promptStore.getCurrentPrompt)
    const getModuleParams = computed(() => promptStore.getModuleParams)
    const getPromptParams = computed(() => promptStore.getPromptParams)
    const getIeltsScenarioParams = computed(() => promptStore.getIeltsScenarioParams)
    const getCurrentUser = computed(() => userStore.getCurrentUser)
    const getCurrentModule = computed(() => promptStore.getCurrentModule)

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

    onMounted(() => {
      observer.value = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          const hasSearch = activeTab.value === PromptLibraryTabsEnum.MODULES ? searchQueryModules.value.trim() !== "" : searchQueryScenarios.value.trim() !== ""

          if (hasSearch) return

          if (activeTab.value === PromptLibraryTabsEnum.MODULES && getModuleParams.value.hasMore) {
            isListLoading.value = true

            promptStore.fetchModuleList(true, { target_language: targetLanguage.value }).finally(() => {
              isListLoading.value = false
            })
          }

          if (activeTab.value === PromptLibraryTabsEnum.SCENARIOS && getPromptParams.value.hasMore) {
            isListLoading.value = true

            promptStore.fetchScenariosList(true, { is_module_only: false, target_language: targetLanguage.value }).finally(() => {
              isListLoading.value = false
            })
          }

          if (activeTab.value === PromptLibraryTabsEnum.IELTS && getIeltsScenarioParams.value.hasMore) {
            isListLoading.value = true

            promptStore.fetchIeltsScenariosList(true, { ielts_part: currentIeltsPart.value ? currentIeltsPart.value : undefined }).finally(() => {
              isListLoading.value = false
            })
          }
        }
      })

      if (loadMoreTrigger.value) {
        observer.value.observe(loadMoreTrigger.value)
      }
    })

    const toggleExpand = (index: number | string) => {
      expandedScenario.value = expandedScenario.value === index ? null : index
    }

    const toggleIeltsPart = async (value: SessionIeltsPartEnum | null) => {
      if (currentIeltsPart.value === value) return

      try {
        isLoading.value = true

        currentIeltsPart.value = value

        promptStore.resetIeltsScenarioParams()
        await promptStore.fetchIeltsScenariosList(false, { ielts_part: value ? value : undefined })
      } catch (error: unknown) {
        console.log(error)
      } finally {
        isLoading.value = false
      }
    }

    const openScenarios = async (module_id: string) => {
      try {
        isLoading.value = true

        window.dataLayer = window.dataLayer || []
        window.dataLayer.push({
          event: "MODULE_OPENED",
          module_name: getCurrentModule.value.name,
          module_id: getCurrentModule.value._id,
          user_id: getCurrentUser.value?._id,
        })

        await promptStore.fetchModuleScenarios(module_id)

        isOverview.value = false
      } catch (error: unknown) {
        console.log(error)
      } finally {
        isLoading.value = false
      }
    }

    const selectPrompt = (prompt: IPromptScenarioEntity) => {
      window.dataLayer = window.dataLayer || []
      window.dataLayer.push({
        event: "SCENARIO_STARTED",
        scenario_name: getCurrentPrompt.value.name,
        scenario_id: getCurrentPrompt.value._id,
        user_id: getCurrentUser.value?._id,
      })

      promptStore.setPrompt(prompt)
      clearSearch()

      router.push({ name: "platform.conversation" })
    }

    const toggleTabs = (tab: PromptLibraryTabsEnum) => {
      activeTab.value = tab
    }

    const onSearchInput = async (e: Event) => {
      const target = e.target as HTMLInputElement
      const val = target.value

      if (activeTab.value === PromptLibraryTabsEnum.MODULES) {
        searchQueryModules.value = val
      } else {
        searchQueryScenarios.value = val
      }

      if (debounceTimeout) clearTimeout(debounceTimeout)

      debounceTimeout = setTimeout(() => {
        handleSearchInput(val)
      }, 300)
    }

    const handleSearchInput = async (query: string) => {
      observer.value?.disconnect()

      if (activeTab.value === PromptLibraryTabsEnum.MODULES) {
        promptStore.resetModuleParams()
        await promptStore.fetchModuleList(false, {
          search: query,
          target_language: targetLanguage.value,
        })
      } else if (activeTab.value === PromptLibraryTabsEnum.SCENARIOS) {
        expandedScenario.value = null
        promptStore.resetPromptParams()
        await promptStore.fetchScenariosList(false, {
          search: query,
          is_module_only: false,
          target_language: targetLanguage.value,
        })
      }

      nextTick(() => {
        if (loadMoreTrigger.value) {
          observer.value?.observe(loadMoreTrigger.value)
        }
      })
    }

    const clearSearch = () => {
      if (activeTab.value === PromptLibraryTabsEnum.MODULES) {
        searchQueryModules.value = ""
        promptStore.resetModuleParams()
        promptStore.fetchModuleList(false, { target_language: targetLanguage.value })
      } else {
        expandedScenario.value = ""
        searchQueryScenarios.value = ""
        promptStore.resetPromptParams()
        promptStore.fetchScenariosList(false, { is_module_only: false, target_language: targetLanguage.value })
      }
    }

    const updateTargetLanguage = async (value: string) => {
      try {
        isLoading.value = true

        targetLanguage.value = value
        expandedScenario.value = null

        searchQueryModules.value = ""
        searchQueryScenarios.value = ""

        promptStore.resetModuleParams()
        promptStore.resetPromptParams()

        await Promise.all([promptStore.fetchModuleList(false, { target_language: value }), promptStore.fetchScenariosList(false, { is_module_only: false, target_language: value })])
      } catch (error: unknown) {
        console.log(error)
      } finally {
        isLoading.value = false
      }
    }

    onBeforeUnmount(() => {
      observer.value?.disconnect()
    })

    return {
      isReady,
      isOverview,
      isLoading,
      isListLoading,
      activeTab,
      targetLanguage,
      currentIeltsPart,
      searchQueryModules,
      searchQueryScenarios,
      loadMoreTrigger,
      getIsPageLoading,
      expandedScenario,
      getCurrentModule,
      toggleIeltsPart,
      clearSearch,
      onSearchInput,
      toggleExpand,
      toggleTabs,
      openScenarios,
      selectPrompt,
      updateTargetLanguage,
      PromptLibraryTabsEnum,
      SessionIeltsPartEnum,
    }
  },
})
</script>
