<template>
  <div class="w-full h-full overflow-y-auto p-6 bg-white rounded-lg shadow-md text-gray-800">
    <form class="max-w-md space-y-4" @submit.prevent="onSubmit">
      <div>
        <label class="block text-sm font-medium text-text-muted">Email (readonly)</label>
        <input type="email" :value="getCurrentUser?.email" disabled class="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-text-base" />
        <p v-if="errorMessages.email" class="mt-1 text-sm text-red-600">{{ errorMessages.email }}</p>
      </div>

      <div>
        <label class="block text-sm font-medium text-text-muted">First Name</label>
        <input v-model="form.first_name" type="text" class="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg text-text-base" />
        <p v-if="errorMessages.first_name" class="mt-1 text-sm text-red-600">{{ errorMessages.first_name }}</p>
      </div>

      <div>
        <label class="block text-sm font-medium text-text-muted">Last Name</label>
        <input v-model="form.last_name" type="text" class="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg text-text-base" />
        <p v-if="errorMessages.last_name" class="mt-1 text-sm text-red-600">{{ errorMessages.last_name }}</p>
      </div>

      <div>
        <label for="country" class="block text-sm font-medium text-text-muted">Country</label>
        <div class="relative">
          <select
            id="country"
            v-model="form.country"
            required
            class="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-text-base appearance-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent pr-10"
          >
            <option value="" disabled>Select your country</option>
            <option v-for="country in countryOptions" :key="country.alpha_2" :value="country.alpha_2">
              {{ country.name }}
            </option>
          </select>
          <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
            <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        <p v-if="errorMessages.country" class="mt-1 text-sm text-red-600">{{ errorMessages.country }}</p>
      </div>

      <div>
        <label for="explanation_language" class="block text-sm font-medium text-text-muted">Explanation Language</label>
        <div class="relative">
          <select
            id="explanation_language"
            v-model="form.explanation_language"
            required
            class="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-text-base appearance-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent pr-10"
          >
            <option value="" disabled>Select a language</option>
            <option v-for="lang in languageOptions" :key="lang.language_iso" :value="lang.language_iso">
              {{ lang.language }}
            </option>
          </select>
          <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
            <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        <p v-if="errorMessages.explanation_language" class="mt-1 text-sm text-red-600">{{ errorMessages.explanation_language }}</p>
      </div>

      <div v-if="errorMessages?._global" class="text-sm text-red-600 bg-red-100 border border-red-200 rounded-md p-3">
        {{ errorMessages._global }}
      </div>

      <div class="flex items-center gap-4 mt-6">
        <button type="button" @click="$emit('close')" class="px-4 py-2 bg-gray-100 text-text-base rounded-md hover:bg-gray-200 transition">← Back</button>

        <button type="submit" :disabled="!isChanged" class="px-4 py-2 bg-primary text-white rounded-md transition hover:bg-primaryDark disabled:opacity-50 disabled:cursor-not-allowed">Save</button>
      </div>
    </form>

    <div v-if="getCurrentSubscription && getCurrentPlan" class="mt-8 p-6 border border-gray-200 rounded-lg bg-gray-50 shadow-sm">
      <h2 class="text-xl font-bold mb-4 text-gray-800">Your Subscription</h2>

      <div class="mb-2 text-gray-700">
        <span class="font-medium">Plan:</span>
        {{ getCurrentPlan.name }} — {{ getCurrentPlan.amount }} {{ getCurrentPlan.currency }} / {{ getCurrentPlan.billing_period.toLowerCase() }}
      </div>

      <div class="mb-2 text-gray-700">
        <span class="font-medium">Status: </span>
        <span
          :class="{
            'text-green-600': isActiveOrTrialing,
            'text-yellow-600': isPastDue,
            'text-red-600': isCancelled,
          }"
        >
          {{ getCurrentSubscription.status }}
        </span>
      </div>

      <div class="mb-2 text-gray-700"><span class="font-medium">Started at:</span> {{ formatDate(getCurrentSubscription.start_date) }}</div>

      <div v-if="!isPendingCancel && !isCancelled" class="mb-2 text-gray-700"><span class="font-medium">Next Payment:</span> {{ formatDate(getCurrentSubscription.next_payment_date ?? "") }}</div>

      <div v-if="isPendingCancel" class="p-4 border border-yellow-300 bg-yellow-100 rounded-lg text-yellow-800 mt-4">
        <p class="mb-2">
          Subscription will be cancelled on
          <strong>{{ formatDate(getCurrentSubscription.scheduled_cancel_at ?? "") }}</strong
          >.
        </p>
        <button @click="recancelSubscription" type="button" class="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition">Resume Subscription</button>
      </div>

      <div v-if="isPastDue" class="p-4 border border-red-300 bg-red-100 rounded-lg text-red-800 mt-4">
        <p class="mb-2 font-medium">Payment Failed</p>
        <p>Please update your payment method to keep your subscription active.</p>
        <button @click="updatePaymentDetailsLink" class="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition">Update Payment Method</button>
      </div>

      <div v-if="isCancelled" class="p-4 border border-gray-300 bg-gray-100 rounded-lg text-gray-700 mt-4">
        <p class="mb-2 font-medium">Your subscription has been cancelled.</p>
        <p>You can always pick a new plan to continue using premium features.</p>
        <router-link :to="{ name: 'platform.tariff-plans' }">
          <button class="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition">Choose a New Plan</button>
        </router-link>
      </div>

      <div class="flex flex-col gap-4 mt-4">
        <button v-if="isTrialing && !isPendingCancel" type="button" class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition" @click="isActiveFromTrialOpen = true">
          Unlock Full Access
        </button>

        <button
          v-if="(isTrialing || isActive) && !isPendingCancel"
          @click="isUnsubscribedConfirmOpened = true"
          type="button"
          class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
        >
          Cancel Subscription
        </button>
      </div>
    </div>

    <div class="flex flex-col gap-2 mt-8 border-t pt-4">
      <button type="button" @click="isDeleteHistoryModalOpen = true" class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition">Delete All Conversation History</button>
    </div>

    <v-modal v-model="isDeleteHistoryModalOpen">
      <TheConfirmation
        title="Delete All Conversation History"
        description="Are you sure you want to delete your all conversation history? This action cannot be undone."
        @accept="onDeleteConversation"
        @cancel="isDeleteHistoryModalOpen = false"
      />
    </v-modal>

    <v-modal v-model="isUnsubscribedConfirmOpened">
      <TheConfirmation
        title="Cancel Subscription"
        description="Are you sure you want to cancel your current subscription? You will lose access to all premium features after the end of the billing period."
        @accept="cancelSubscription"
        @cancel="isUnsubscribedConfirmOpened = false"
      />
    </v-modal>

    <v-modal v-model="isActiveFromTrialOpen">
      <TheConfirmation
        title="End Trial Early"
        description="Do you want to end your trial and start your full subscription now? This action cannot be undone — you’ll be charged immediately and won’t be able to return to the trial."
        @accept="unlockFullAccess"
        @cancel="isActiveFromTrialOpen = false"
      />
    </v-modal>
  </div>
</template>

<script lang="ts">
import { communicationReviewStore, plansStore, subscriptionStore, userStore } from "@/app"
import { computed, ref, defineComponent, reactive } from "vue"
import { deleteAllHistoryHandler, getPaymentDetailsLinkHandler } from "@/shared/api"
import { formatDate } from "@/shared/lib"
import { SubscriptionTypeEnum } from "@/shared/types"
import CountryList from "@/shared/json_data/countries.json"
import LanguagesList from "@/shared/json_data/languages.json"
import TheConfirmation from "../../../TheConfirmation"

export default defineComponent({
  components: {
    TheConfirmation,
  },

  setup(_, { emit }) {
    const errorMessages = ref<Record<string, string>>({})
    const countryOptions = CountryList.map(({ name, alpha_2 }) => ({
      name,
      alpha_2,
    }))
    const languageOptions = LanguagesList.map(({ language, language_iso }) => ({
      language,
      language_iso,
    }))
    const isDeleteHistoryModalOpen = ref<boolean>(false)
    const isUnsubscribedConfirmOpened = ref<boolean>(false)
    const isActiveFromTrialOpen = ref<boolean>(false)

    const getCurrentSubscription = computed(() => subscriptionStore.getCurrentSubscription)
    const getCurrentPlan = computed(() => plansStore.getCurrentPlan)
    const getCurrentUser = computed(() => userStore.getCurrentUser)
    const isActive = computed(() => getCurrentSubscription.value?.status === SubscriptionTypeEnum.ACTIVE)
    const isTrialing = computed(() => getCurrentSubscription.value?.status === SubscriptionTypeEnum.TRIALING)
    const isCancelled = computed(() => getCurrentSubscription.value?.status === SubscriptionTypeEnum.CANCELLED)
    const isPastDue = computed(() => getCurrentSubscription.value?.status === SubscriptionTypeEnum.PAST_DUE)
    const isPendingCancel = computed(() => getCurrentSubscription.value?.is_pending_cancel)
    const isActiveOrTrialing = computed(() => isActive.value || isTrialing.value)

    const isChanged = computed(() => {
      const user = getCurrentUser.value
      if (!user) return false

      return form.first_name !== user.first_name || form.last_name !== user.last_name || form.country !== user.country || form.explanation_language !== user.explanation_language
    })

    const form = reactive({
      first_name: getCurrentUser.value?.first_name || "",
      last_name: getCurrentUser.value?.last_name || "",
      country: getCurrentUser.value?.country || "",
      explanation_language: getCurrentUser.value?.explanation_language || "",
    })

    const onSubmit = async () => {
      if (!isChanged.value) return

      try {
        errorMessages.value = {}

        await userStore.fetchPatchUser(form)

        emit("close")
      } catch (error: any) {
        if (error.response?.status === 400 && error.response.data?.error?.fieldErrors) {
          const fields = error.response.data.error.fieldErrors
          for (const key in fields) {
            errorMessages.value[key] = fields[key][0]
          }
        } else {
          errorMessages.value._global = "Something went wrong. Please try again later."
        }
      } finally {
        setTimeout(() => {
          errorMessages.value = {}
        }, 3000)
      }
    }

    const onDeleteConversation = async () => {
      try {
        await deleteAllHistoryHandler()

        communicationReviewStore.setReviewList([])
      } catch (error: unknown) {
        console.log(error)
      } finally {
        isDeleteHistoryModalOpen.value = false
      }
    }

    const cancelSubscription = async () => {
      try {
        await subscriptionStore.fetchCancelSubscription()
      } catch (error: unknown) {
        console.log(error)
      } finally {
        isUnsubscribedConfirmOpened.value = false
      }
    }

    const recancelSubscription = async () => {
      try {
        await subscriptionStore.fetchRecancelSubscription()
      } catch (error: unknown) {
        console.log(error)
      }
    }

    const unlockFullAccess = async () => {
      try {
        await subscriptionStore.fetchActivateFromTrialSubscription()
      } catch (error: unknown) {
        console.log(error)
      } finally {
        isActiveFromTrialOpen.value = false
      }
    }

    const updatePaymentDetailsLink = async () => {
      try {
        const url = await getPaymentDetailsLinkHandler()

        window.open(url, "_blank")
      } catch (error: unknown) {
        console.log(error)
      }
    }

    return {
      form,
      isChanged,
      isDeleteHistoryModalOpen,
      isUnsubscribedConfirmOpened,
      isActiveFromTrialOpen,
      errorMessages,
      countryOptions,
      languageOptions,
      getCurrentUser,
      getCurrentSubscription,
      getCurrentPlan,
      isActive,
      isTrialing,
      isCancelled,
      isPastDue,
      isPendingCancel,
      isActiveOrTrialing,
      onDeleteConversation,
      cancelSubscription,
      unlockFullAccess,
      recancelSubscription,
      updatePaymentDetailsLink,
      onSubmit,
      formatDate,
      SubscriptionTypeEnum,
    }
  },
})
</script>
