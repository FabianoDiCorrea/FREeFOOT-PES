<template>
  <div class="gauge-wrapper">
    <div class="gauge-container">
      <div class="gauge-body">
        <!-- Scale Background (Fixed 4 Colors) -->
        <div class="gauge-scale-background"></div>
        
        <!-- Mask to create arc -->
        <div class="gauge-mask"></div>

        <!-- Value Display -->
        <div class="gauge-cover">
          <div class="gauge-value" :style="{ color: valueColor }">{{ value }}%</div>
          <div class="gauge-label text-uppercase">{{ label }}</div>
        </div>

        <!-- Needle -->
        <div class="gauge-needle" :style="needleStyles"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  value: {
    type: Number,
    default: 0
  },
  label: {
    type: String,
    default: 'Performance'
  }
})

// Cores fixas solicitadas
const colors = {
    ruim: '#dc3545',      // Vermelho (0-30%)
    regular: '#ffc107',   // Amarelo (30-70%)
    bom: '#90ee90',       // Verde Claro (70-85%)
    excelente: '#28a745'  // Verde Escuro (85-100%)
}

const valueColor = computed(() => {
    if (props.value >= 85) return colors.excelente
    if (props.value >= 70) return colors.bom
    if (props.value >= 30) return colors.regular
    return colors.ruim
})

const needleStyles = computed(() => {
  // 0% = -90deg, 100% = 90deg
  const rotation = -90 + (Math.min(props.value, 100) / 100) * 180
  return {
    '--target-rotation': `${rotation}deg`,
    transform: `rotate(${rotation}deg)`
  }
})
</script>

<style scoped>
.gauge-wrapper {
  position: relative;
  width: 200px;
  height: 110px;
  margin: 0 auto;
  cursor: pointer;
}

.gauge-wrapper:hover .gauge-needle {
    animation: needle-sweep 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.gauge-wrapper:hover .gauge-value {
    animation: value-pulse 0.5s ease;
}

@keyframes needle-sweep {
    0% { transform: rotate(-90deg); }
    70% { transform: rotate(calc(var(--target-rotation) + 10deg)); }
    100% { transform: rotate(var(--target-rotation)); }
}

@keyframes value-pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.2); }
    100% { transform: scale(1); }
}

.gauge-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.gauge-body {
  position: relative;
  width: 200px;
  height: 100px;
  border-radius: 100px 100px 0 0;
  overflow: hidden;
}

/* 
  Conic Gradient para as 4 cores fixas:
  Vermelho (30%): 0 -> 30% mapped to 0-180deg range? 
  No CSS conic-gradient, o angulo começa em cima (0deg).
  Queremos um arco de -90deg a +90deg (180 graus total).
  
  Mapeamento (180deg total):
  - Vermelho: 30% do total = 54deg. Range: 270deg (start) até 324deg
  - Amarelo: 40% do total = 72deg. Range: 324deg até 36deg (passando pelo 0)
  - Verde Claro: 15% = 27deg. Range: 36deg até 63deg
  - Verde Escuro: 15% = 27deg. Range: 63deg até 90deg
  
  Simpler approach: Use a wrapper rotated or calc offsets.
  Let's use specific degress assuming standard clock:
  Start at -90deg (270deg).
  30% of 180 = 54deg. End Red = -36deg.
  40% of 180 = 72deg. End Yellow = +36deg.
  15% of 180 = 27deg. End LightGreen = +63deg.
  15% of 180 = 27deg. End DarkGreen = +90deg.
*/
.gauge-scale-background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 200%; /* Dobro da altura para ser um circulo completo e cortar */
    border-radius: 50%;
    background: conic-gradient(
        from 270deg,
        #dc3545 0deg,
        #dc3545 54deg,   /* 30% */
        #ffc107 54deg,
        #ffc107 126deg,  /* 30% + 40% = 70% -> 126deg */
        #90ee90 126deg,
        #90ee90 153deg,  /* 70% + 15% = 85% -> 153deg */
        #28a745 153deg,
        #28a745 180deg   /* 85% + 15% = 100% -> 180deg */
    );
}

.gauge-mask {
    position: absolute;
    top: 20px;
    left: 20px;
    width: 160px;
    height: 160px; /* Mascarar o centro */
    background: #181818; /* Cor do fundo do card */
    border-radius: 50%;
    z-index: 1;
}

.gauge-cover {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  text-align: center;
  z-index: 2;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 5px;
}

.gauge-value {
  font-family: 'Outfit', sans-serif;
  font-weight: 900;
  font-size: 2rem;
  line-height: 1;
  text-shadow: 0 2px 10px rgba(0,0,0,0.5);
}

.gauge-label {
  font-size: 0.65rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.4);
  letter-spacing: 2px;
  margin-top: 5px;
}

.gauge-needle {
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 4px;
  height: 95px; /* Quase o topo */
  background: #fff;
  transform-origin: bottom center;
  transition: transform 1.0s cubic-bezier(0.4, 0.0, 0.2, 1);
  z-index: 5;
  border-radius: 4px 4px 0 0;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.8);
}

.gauge-needle::after {
    content: '';
    position: absolute;
    bottom: -6px;
    left: -6px;
    width: 16px;
    height: 16px;
    background: #fff;
    border-radius: 50%;
    box-shadow: 0 0 5px rgba(0,0,0,0.5);
}
</style>
