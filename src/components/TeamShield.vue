<template>
  <div class="shield-container" :class="{ 'borderless': borderless }" :style="{ width: size + 'px', height: size + 'px' }">
    <img 
      v-if="shieldUrl" 
      :src="shieldUrl" 
      :alt="teamName"
      class="shield-img"
      @error="handleError"
    >
    <div v-else class="shield-fallback">
      <i class="bi bi-shield text-secondary"></i>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { dataSearchService } from '../services/dataSearch.service'

const props = defineProps({
  teamName: String,
  size: {
    type: Number,
    default: 40
  },
  forceUrl: String, // Permite passar uma URL direta se já tivermos
  borderless: Boolean
})

const hasError = ref(false)
const cachedUrl = ref(null)

const shieldUrl = computed(() => {
  if (props.forceUrl) return props.forceUrl
  if (cachedUrl.value) return cachedUrl.value
  if (!props.teamName || hasError.value) return null
  
  const team = dataSearchService.findClub(props.teamName) || dataSearchService.findNationalTeam(props.teamName)
  return team?.escudo_url || team?.bandeira_url || null
})

// Sistema de Cache
import { imageCacheService } from '../services/imageCache.service'

watch(() => shieldUrl.value, async (newUrl) => {
  if (newUrl && !newUrl.startsWith('data:')) {
    const base64 = await imageCacheService.getOrCache(newUrl)
    if (base64 && base64.startsWith('data:')) {
      cachedUrl.value = base64
    }
  }
}, { immediate: true })

const handleError = () => {
  hasError.value = true
  cachedUrl.value = null
}

// Reset erro se o nome mudar
watch(() => props.teamName, () => {
  hasError.value = false
  cachedUrl.value = null
})
</script>

<style scoped>
.shield-container {
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  overflow: visible;
  border: none;
  transition: all 0.3s ease;
}

.shield-container.borderless {
  background: transparent !important;
  border: none !important;
  border-radius: 0 !important;
  overflow: visible !important;
}

.shield-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 0;
}

.shield-fallback {
  font-size: 1.2rem;
  opacity: 0.3;
}
</style>
