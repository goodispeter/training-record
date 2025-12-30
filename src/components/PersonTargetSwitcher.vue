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
        style="width: 130px"
      />
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
} from '@/utils/personTargetConfig'

interface Props {
  person: string
  target: string
}

const props = defineProps<Props>()
const router = useRouter()

// 當前選中的人員和目標
const currentPerson = computed(() => props.person)
const currentTarget = computed(() => props.target)

// 目標選項（根據當前人員動態調整）
const targetOptions = computed(() => {
  const availableTargets = getAvailableTargets(currentPerson.value)
  return availableTargets.map((target) => ({
    label: getTargetDisplayName(target),
    value: target,
  }))
})

// 切換人員
const switchPerson = async (newPerson: string) => {
  if (newPerson !== props.person) {
    let newTarget = props.target

    // 檢查新人員是否有當前目標，如果沒有則使用第一個可用目標
    if (!hasTarget(newPerson, props.target)) {
      const availableTargets = getAvailableTargets(newPerson)
      newTarget = availableTargets[0] || '2026tokyo' // 如果沒有可用目標，回退到 2026tokyo
    }

    await router.push(`/${newPerson}/${newTarget}`)
  }
}

// 切換目標地點
const switchTarget = async (newTarget: string) => {
  if (newTarget !== props.target) {
    await router.push(`/${props.person}/${newTarget}`)
  }
}
</script>
