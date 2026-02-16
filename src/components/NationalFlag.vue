<template>
  <div class="flag-container" :style="{ width: size + 'px' }">
    <img 
      v-if="flagUrl" 
      :src="flagUrl" 
      :alt="countryName"
      class="flag-img"
      @error="handleError"
    >
    <div v-else class="flag-placeholder">
      <i class="bi bi-flag-fill opacity-50"></i>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { dataSearchService } from '../services/dataSearch.service'

const props = defineProps({
  countryName: String,
  size: {
    type: Number,
    default: 24
  },
  forceUrl: String
})

const hasError = ref(false)
const cachedUrl = ref(null)

const flagUrl = computed(() => {
  if (cachedUrl.value) return cachedUrl.value
  if (props.forceUrl) return props.forceUrl
  if (!props.countryName || hasError.value) return null
  const data = dataSearchService.findNationalTeam(props.countryName) || dataSearchService.findClub(props.countryName)
  return data?.bandeira_url || null
})

// Sistema de Cache
import { imageCacheService } from '../services/imageCache.service'

watch(() => flagUrl.value, async (newUrl) => {
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

watch(() => props.countryName, () => {
  hasError.value = false
  cachedUrl.value = null
})
</script>

<style scoped>
.flag-container {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  background: transparent;
}

.flag-img {
  width: 100%;
  height: 100%;
  aspect-ratio: 1/1;
  object-fit: cover;
  border-radius: 50%;
  border: none;
  box-shadow: none;
}

.flag-placeholder {
  width: 100%;
  aspect-ratio: 1/1;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  border: 1px dashed rgba(255, 255, 255, 0.2);
  border-radius: 50%;
}
</style>
