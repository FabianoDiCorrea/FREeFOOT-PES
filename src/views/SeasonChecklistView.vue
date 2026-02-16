<template>
  <div class="checklist-container p-4 min-vh-100 bg-dark text-white">
    <!-- HEADER -->
    <div class="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom border-secondary border-opacity-25">
       <div class="d-flex align-items-center gap-3">
          <button @click="$router.push('/universo')" class="btn btn-outline-light btn-sm">
             <i class="bi bi-arrow-left"></i> VOLTAR
          </button>
          <h2 class="m-0 fw-black text-uppercase ls-1">CHECKLIST DE TEMPORADAS</h2>
       </div>
       <div class="d-flex gap-2">
          <button @click="activeTab = 'americas'" class="btn btn-sm fw-bold px-4" 
             :class="activeTab === 'americas' ? 'btn-info text-dark' : 'btn-outline-secondary'">
             AMÉRICAS 🌎
          </button>
          <button @click="activeTab = 'europa'" class="btn btn-sm fw-bold px-4" 
             :class="activeTab === 'europa' ? 'btn-info text-dark' : 'btn-outline-secondary'">
             EUROPA 🇪🇺
          </button>
       </div>
    </div>

    <!-- LOADING -->
    <div v-if="loading" class="text-center py-5">
       <div class="spinner-border text-info mb-3"></div>
       <p class="text-muted small">ANALISANDO UNIVERSO...</p>
    </div>

    <!-- CONTENT -->
    <div v-else class="checklist-content custom-scrollbar">
       
       <!-- LOOP DE TEMPORADAS (ANOS) -->
       <div v-for="year in sortedYears" :key="year" class="mb-5">
          <div class="d-flex align-items-center gap-3 mb-3">
             <h3 class="fw-black text-warning m-0 text-uppercase">{{ year }}</h3>
             <div class="h-line flex-grow-1 bg-secondary opacity-25"></div>
          </div>

          <!-- GRID DE COMPETIÇÕES -->
          <div class="row g-3">
             <div v-for="comp in getCompetitionsForRegion(activeTab)" :key="comp.id" class="col-12 col-md-6 col-lg-4 col-xl-3">
                
                <!-- CARD DE COMPETIÇÃO -->
                <div class="checklist-card p-3 rounded" 
                     :class="getStatus(comp, year).registered ? 'border-success bg-success bg-opacity-10' : 'border-danger bg-danger bg-opacity-10'"
                     style="border: 1px solid;">
                   
                   <div class="d-flex justify-content-between align-items-start mb-2">
                      <div class="d-flex align-items-center gap-2">
                         <img :src="comp.logo" class="comp-logo-sm" />
                         <div>
                            <div class="fw-bold small text-uppercase">{{ comp.nome }}</div>
                            <div class="x-small text-muted">{{ comp.pais }}</div>
                         </div>
                      </div>
                      
                      <!-- ÍCONE DE STATUS PRINCIPAL -->
                      <i class="bi fs-4" 
                         :class="getStatus(comp, year).registered ? 'bi-check-circle-fill text-success' : 'bi-x-circle-fill text-danger'"></i>
                   </div>

                   <!-- DETALHES (SÓ SE REGISTRADO) -->
                   <div v-if="getStatus(comp, year).registered" class="d-flex gap-2 mt-2 pt-2 border-top border-secondary border-opacity-25">
                      <span class="badge d-flex align-items-center gap-1" 
                            :class="getStatus(comp, year).hasTable ? 'bg-success text-white' : 'bg-secondary text-white opacity-50'">
                         <i class="bi bi-table"></i> TABELA
                      </span>
                      <span class="badge d-flex align-items-center gap-1" 
                            :class="getStatus(comp, year).hasScorers ? 'bg-warning text-dark' : 'bg-secondary text-white opacity-50'">
                         <i class="bi bi-trophy"></i> ARTILHARIA
                      </span>
                   </div>
                   <div v-else class="mt-2 pt-2 text-center x-small text-danger opacity-75 fw-bold">
                      PENDENTE
                   </div>

                </div>
             </div>
          </div>
       </div>

       <div v-if="sortedYears.length === 0" class="text-center py-5 opacity-50">
          <i class="bi bi-calendar-x fs-1 mb-3 d-block"></i>
          NENHUMA TEMPORADA ENCONTRADA PARA ESTA REGIÃO.
       </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { seasonService } from '../services/season.service'
import { ALL_COMPETITIONS_DATA as RAW_DATA } from '../services/competitions.data' 

const loading = ref(true)
const activeTab = ref('americas')
const seasons = ref([])
const availableYears = ref([])
const allCompetitions = ref([])

import { seasonStore } from '../services/season.store'
import { watch } from 'vue'

onMounted(async () => {
    loading.value = true
    // Tenta carregar do store primeiro, se vazio busca do serviço
    if (seasonStore.list.length > 0) {
        seasons.value = seasonStore.list
    } else {
        seasons.value = await seasonService.getAll()
    }
    
    // Flatten Competitions Data

    const flat = []
    RAW_DATA.forEach(region => {
        // Add country competitions
        region.paises.forEach(pais => {
            if (pais.competicoes) {
                flat.push(...pais.competicoes)
            }
        })
        // Add continental competitions
        if (region.continentais) {
            flat.push(...region.continentais)
        }
    })
    allCompetitions.value = flat

    // Extract unique years
    const yearsSet = new Set(seasons.value.map(s => s.ano))
    availableYears.value = Array.from(yearsSet).sort().reverse()
    
    loading.value = false
})

watch(() => seasonStore.list, (newList) => {
    if (newList && newList.length > 0) {
        seasons.value = newList
        // Atualizar anos disponíveis também
        const yearsSet = new Set(newList.map(s => s.ano))
        availableYears.value = Array.from(yearsSet).sort().reverse()
    }
}, { deep: true })

// Filter years based on active tab
const sortedYears = computed(() => {
    return availableYears.value.filter(y => {
        if (activeTab.value === 'americas') return y.includes('/') // 2025/2026
        if (activeTab.value === 'europa') return !y.includes('/') && y.length === 4 // 2026
        return false
    })
})

const getCompetitionsForRegion = (region) => {
    return allCompetitions.value.filter(c => {
        if (region === 'americas') {
            return ['Brasil', 'Argentina', 'Uruguai', 'Colômbia', 'Chile', 'Paraguai', 'Bolívia', 'Peru', 'Equador', 'Estados Unidos', 'México', 'Costa Rica', 'América do Sul', 'América do Norte'].includes(c.pais)
        }
        if (region === 'europa') {
            return ['Inglaterra', 'Itália', 'Espanha', 'França', 'Alemanha', 'Europa'].includes(c.pais)
        }
        return false
    })
}

const getStatus = (comp, year) => {
    // Find matching season in DB
    // Matching logic similar to "CompetitionHistoryView" local filter but stricter?
    // Or just look for compID + year if we trust IDs?
    // User data might verify by name. Let's start with flexible name match + year.
    
    const normalize = (str) => str?.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() || ""
    
    const match = seasons.value.find(s => {
        if (s.ano !== year) return false
        
        let sCountry = s.pais ? normalize(s.pais) : null
        
        // 0. Inferência Inteligente de País (Se ausente)
        if (!sCountry) {
            const sn = normalize(s.competitionName)
            if (sn.includes('brasileirao') || sn.includes('copa do brasil')) sCountry = 'brasil'
            if (sn.includes('argentina') || sn.includes('primera nacional') || sn.includes('liga profissional')) sCountry = 'argentina'
            if (sn.includes('inglesa') || sn.includes('premier league') || sn.includes('fa cup')) sCountry = 'inglaterra'
        }

        const cCountry = comp.pais ? normalize(comp.pais) : null

        // 1. Validação de País (Agora mais robusta com a inferência)
        if (cCountry && sCountry && sCountry !== cCountry) return false

        // 1.5 FIREWALL EXPLÍCITO (Separação Brasil x Argentina) forçada
        const sName = normalize(s.competitionName)
        const cName = normalize(comp.nome)

        if (cCountry === 'brasil') {
            if (sName.includes('primera nacional') || sName.includes('liga profissional') || sName.includes('argentina')) return false
        }
        if (cCountry === 'argentina') {
            if (sName.includes('brasileirao') || sName.includes('serie a') || sName.includes('serie b') || sName.includes('copa do brasil')) return false
        }

        // 4. Proteção Específica: Copa vs Supercopa
        // "Copa do Brasil" não pode casar com "Supercopa do Brasil"
        if (cName.includes('copa') && !cName.includes('super') && sName.includes('super')) return false
        if (sName.includes('copa') && !sName.includes('super') && cName.includes('super')) return false

        // Match logic
        if (sName === cName) return true
        
        // Strict Special Cases
        if (cName === 'primera nacional' && sName === 'primera nacional') return true
        
        // Only match generic "Nacional" if it's NOT "Primera Nacional"
        if (cName.includes('nacional') && !cName.includes('primera nacional') && (sName.includes('nacional') || sName.includes('serie b'))) return true
        
        // Strict Professional/Serie A check
        if (cName.includes('profissional') && (sName.includes('profissional') || sName.includes('serie a')) && cCountry === sCountry) return true
        
        return false
    })
    
    if (!match) return { registered: false }
    
    // Check for valid scorers (must have a name)
    const hasValidTopScorer = match.topScorers && match.topScorers.some(s => s.nome && s.nome.trim() !== '')
    const hasValidLegacyScorer = match.artilheiro && match.artilheiro.nome && match.artilheiro.nome.trim() !== ''

    return {
        registered: true,
        hasTable: !!match.tabela,
        hasScorers: hasValidTopScorer || hasValidLegacyScorer
    }
}
</script>

<style scoped>
.checklist-container {
    padding-bottom: 5rem;
}
.h-line { height: 1px; }
.comp-logo-sm {
    width: 24px;
    height: 24px;
    object-fit: contain;
}
.checklist-card {
    transition: all 0.2s;
    font-size: 0.85rem;
    padding: 0.75rem !important;
}
/* Removed hover effect and cursor pointer */
/* .checklist-card:hover {
    transition: none;
    transform: none;
    box-shadow: none;
} */
.x-small { font-size: 0.65rem; }
.badge { font-size: 0.6rem; padding: 0.3em 0.5em; }
</style>
