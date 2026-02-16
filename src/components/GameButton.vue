<template>
  <button class="btn-game" :class="variant" @click="$emit('click')">
    <slot></slot>
  </button>
</template>

<script setup>
defineProps({
  variant: {
    type: String,
    default: ''
  }
})
defineEmits(['click'])
</script>

<style scoped>
.btn-game {
  background-color: var(--color-primary);
  border: 2px solid var(--color-accent);
  color: white;
  padding: 10px 25px;
  text-transform: uppercase;
  font-weight: bold;
  letter-spacing: 1.5px;
  clip-path: polygon(5% 0, 100% 0, 95% 100%, 0 100%);
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  cursor: pointer;
  outline: none;
}

.btn-game:hover {
  background-color: var(--color-secondary);
  color: var(--color-primary);
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 0 15px var(--color-secondary);
  border-color: white;
}

.btn-game:active {
  transform: translateY(0) scale(0.98);
}
</style>
