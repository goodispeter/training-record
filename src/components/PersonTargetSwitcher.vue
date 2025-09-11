<template>
  <div class="flex items-center justify-between w-full mb-4">
    <div class="flex gap-4">
      <n-button-group>
        <n-button
          v-for="(config, personKey) in PERSON_CONFIG"
          :key="personKey"
          :type="currentPerson === personKey ? 'primary' : 'default'"
          @click="switchPerson(personKey)"
          size="small"
        >
          {{ config.emoji }} {{ config.displayName }}
        </n-button>
      </n-button-group>
      <n-select
        :value="currentTarget"
        @update:value="switchTarget"
        :options="targetOptions"
        size="small"
        style="width: 180px"
      />
    </div>
    <!-- 完賽心得按鈕 -->
    <div class="ml-auto">
      <n-button
        v-if="currentTargetConfig?.link"
        type="default"
        size="medium"
        @click="openLink"
        round
      >
        🏁 完賽心得
      </n-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { NSelect, NButtonGroup, NButton } from 'naive-ui'
import { useRouter } from 'vue-router'
import {
  getAvailableTargets,
  getTargetDisplayName,
  hasTarget,
  PERSON_CONFIG,
  TARGET_CONFIG,
} from '@/utils/personTargetConfig'

interface Props {
  person: string
  year: string
  target: string
}

const props = defineProps<Props>()
const router = useRouter()

// 當前選中的人員、年份和目標
const currentPerson = computed(() => props.person)
const currentYear = computed(() => props.year)
const currentTarget = computed(() => props.target)

// 當前目標的配置
const currentTargetConfig = computed(() => {
  return TARGET_CONFIG[currentTarget.value]
})

// 目標選項（根據當前人員和年份動態調整）
const targetOptions = computed(() => {
  const availableTargets = getAvailableTargets(currentPerson.value, currentYear.value)
  return availableTargets.map((target) => ({
    label: getTargetDisplayName(target),
    value: target,
  }))
})

// 切換人員
const switchPerson = async (newPerson: string) => {
  if (newPerson !== props.person) {
    let newTarget = props.target
    const currentYear = props.year

    // 檢查新人員在當前年份是否有當前目標，如果沒有則使用第一個可用目標
    if (!hasTarget(newPerson, currentYear, props.target)) {
      const availableTargets = getAvailableTargets(newPerson, currentYear)
      newTarget = availableTargets[0] || 'taipei' // 如果沒有可用目標，回退到 taipei
    }

    await router.push(`/${newPerson}/${currentYear}/${newTarget}`)
  }
}

// 切換目標地點
const switchTarget = async (newTarget: string) => {
  if (newTarget !== props.target) {
    await router.push(`/${props.person}/${props.year}/${newTarget}`)
  }
}

// 開啟完賽心得連結
const openLink = () => {
  if (currentTargetConfig.value?.link) {
    window.open(currentTargetConfig.value.link, '_blank')
  }
}
</script>
