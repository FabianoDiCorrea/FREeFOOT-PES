<template>
  <div class="checklist-container p-4 min-vh-100 bg-dark text-white">
    <!-- HEADER -->
    <div class="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom border-secondary border-opacity-25">
       <div class="d-flex align-items-center gap-3">
           <button @click="goBack" class="btn btn-outline-light btn-sm">
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
    <div v-else class="checklist-content custom-scrollbar py-2">
       
       <!-- CONTAINER CENTRALIZADO E ESTREITO (Puxado para o meio) -->
       <div class="checklist-main-wrapper mx-auto">
          
          <!-- LOOP DE TEMPORADAS (ANOS) -->
          <div v-for="year in sortedYears" :key="year" class="mb-5">
             <!-- HEADER DO ANO (ACORDEÃO) -->
             <div class="d-flex align-items-center gap-3 p-3 bg-dark border border-secondary border-opacity-25 rounded-3 cursor-pointer header-year-premium mb-2" @click="toggleYear(year)">
                <i class="bi" :class="expandedYears[year] ? 'bi-chevron-down' : 'bi-chevron-right'"></i>
                <h3 class="fw-black text-warning m-0 text-uppercase ls-2">{{ year }}</h3>
                <div class="ms-auto d-flex align-items-center gap-2">
                   <span class="badge bg-black text-secondary border border-secondary border-opacity-25 px-3">{{ getCompetitionsForRegion(activeTab).length }} COMPETIÇÕES</span>
                </div>
             </div>

             <!-- LISTA DE COMPETIÇÕES (EXPANSÍVEL) -->
             <div v-if="expandedYears[year]" class="d-flex flex-column gap-1 animated-fade-in">
                <div v-for="comp in getCompetitionsForRegion(activeTab)" :key="comp.id" 
                     class="slim-checklist-row p-2 rounded-2 d-flex align-items-center gap-3"
                     :class="[
                       getStatus(comp, year).registered ? 'row-registered' : 'row-pending',
                       { 'intl-row-bg': comp.tipo === 'internacional' }
                     ]">
                   <TeamShield :teamName="comp.campeao" :size="30" :season="year" />
                   <!-- 1. LOGO -->
                   <div class="comp-logo-box">
                       <img v-if="comp.logo" :src="comp.logo" class="comp-logo-img" @error="(e) => e.target.style.display='none'" />
                       <i v-else class="bi bi-trophy-fill text-muted opacity-25"></i>
                   </div>

                   <!-- 2. NOME LIGA (ALTO CONTRASTE) -->
                   <div class="flex-grow-1 min-w-0">
                       <div class="fw-bold text-uppercase text-truncate ls-1 comp-name-label" 
                            :class="getStatus(comp, year).registered ? 'text-white' : 'text-secondary-light'">
                           {{ comp.nome }}
                       </div>
                   </div>

                   <!-- 3 & 4. BANDEIRA E PAÍS -->
                   <div class="d-flex align-items-center gap-2" style="min-width: 130px;">
                       <NationalFlag :countryName="comp.pais || comp.continente" :size="18" />
                       <span class="x-small text-uppercase fw-bold opacity-50 text-white truncate-100">{{ comp.pais || comp.continente }}</span>
                   </div>

                   <!-- 5. TABELA -->
                   <div class="status-icon-center">
                       <i v-if="getStatus(comp, year).hasTable" class="bi bi-grid-3x3-gap-fill text-info" title="Tabela OK"></i>
                       <i v-else class="bi bi-grid-3x3-gap opacity-10"></i>
                   </div>

                   <!-- 6. ARTILHEIRO -->
                   <div class="status-icon-center">
                       <i v-if="getStatus(comp, year).hasScorers" class="bi bi-person-badge-fill text-warning" title="Artilharia OK"></i>
                       <i v-else class="bi bi-person-badge opacity-10"></i>
                   </div>

                   <!-- 7. STATUS FINAL (TIQUE OU X) -->
                   <div class="status-final-box">
                       <i v-if="getStatus(comp, year).registered" class="bi bi-check-circle-fill text-success fs-5"></i>
                       <i v-else class="bi bi-dash-circle text-danger opacity-25 fs-5"></i>
                   </div>

                </div>
             </div>
          </div>

          <!-- ESTADO VAZIO -->
          <div v-if="sortedYears.length === 0" class="text-center py-5 opacity-50">
             <i class="bi bi-calendar-x fs-1 mb-3 d-block"></i>
             NENHUMA TEMPORADA DISPONÍVEL.
          </div>
       </div> <!-- closes checklist-main-wrapper -->
    </div> <!-- closes checklist-content -->
  </div> <!-- closes checklist-container -->
</template>



<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { seasonService } from '../services/season.service'
import { ALL_COMPETITIONS_DATA as RAW_DATA } from '../services/competitions.data' 
import { FEDERATIONS_DATA } from '../services/federations.data'
import { NATIONAL_TEAMS_DATA } from '../data/nationalTeams.data'
import { seasonStore } from '../services/season.store'
import { INTERNATIONAL_DATA } from '../data/internationalCompetitions'
import NationalFlag from '../components/NationalFlag.vue'
import TeamShield from '../components/TeamShield.vue'

const router = useRouter()
const loading = ref(true)
const activeTab = ref('americas')
const seasons = ref([])
const availableYears = ref([])
const allCompetitions = ref([])
const expandedYears = ref({}) // Controle do acordeão

const normalizeYear = (y) => {
    if (!y) return y;
    let val = y.toString().trim();
    // Se tiver parênteses como (2025/2026) 2026, tenta extrair o miolo
    const matchBound = val.match(/\((\d{4}\s?\/\s?\d{4})\)/);
    if (matchBound) val = matchBound[1];

    // Padroniza Xxxx/Yyyy para Xxxx / Yyyy
    if (val.includes('/')) {
        const parts = val.split('/').map(p => p.trim());
        if (parts.length === 2) return `${parts[0]} / ${parts[1]}`;
    }
    return val;
}

const toggleYear = (year) => {
    expandedYears.value[year] = !expandedYears.value[year]
}

const goBack = () => {
    router.push('/universo?reset=true')
}

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
                flat.push(...pais.competicoes.map(c => ({ ...c, pais: pais.nome })))
            }
        })
        // As continentais que vêm do RAW_DATA geralmente já existem no INTERNATIONAL_DATA
        // Para evitar duplicados como "Copa Libertadores" e "Libertadores", vamos filtrar
        if (region.continentais) {
            region.continentais.forEach(c => {
                const isDuplicate = INTERNATIONAL_DATA.some(intComp => 
                    intComp.nome.toLowerCase().includes(c.nome.toLowerCase()) || 
                    c.nome.toLowerCase().includes(intComp.nome.toLowerCase())
                )
                if (!isDuplicate) {
                    flat.push({ ...c, pais: region.continente })
                }
            })
        }
    })

    // Adicionar Competições Internacionais (Libertadores, Sulamericana, etc.)
    flat.push(...INTERNATIONAL_DATA)

    allCompetitions.value = flat

    // Extract unique years (Normalized)
    const yearsSet = new Set(seasons.value.map(s => normalizeYear(s.ano)))
    availableYears.value = Array.from(yearsSet).sort().reverse()
    
    loading.value = false
})

watch(() => seasonStore.list, (newList) => {
    if (newList && newList.length > 0) {
        seasons.value = newList
        // Atualizar anos disponíveis também (Normalized)
        const yearsSet = new Set(newList.map(s => normalizeYear(s.ano)))
        availableYears.value = Array.from(yearsSet).sort().reverse()
    }
}, { deep: true })

// Filter years based on active tab
const sortedYears = computed(() => {
    return availableYears.value.filter(y => {
        if (!y) return false
        if (activeTab.value === 'americas') return y.toString().includes('/') // 2025/2026
        if (activeTab.value === 'europa') return !y.toString().includes('/') && y.toString().length === 4 // 2026
        return false
    })
})

const getCompetitionsForRegion = (region) => {
    return allCompetitions.value.filter(c => {
        const pais = c.pais || ''; 
        const continente = c.continente || '';

        if (region === 'americas') {
            const list = ['Brasil', 'Argentina', 'Uruguai', 'Colômbia', 'Chile', 'Paraguai', 'Bolívia', 'Peru', 'Equador', 'Estados Unidos', 'México', 'Costa Rica', 'América do Sul', 'América do Norte'];
            if (list.includes(pais)) return true;
            if (continente === 'CONMEBOL' || continente === 'CONCACAF') return true;
        }
        if (region === 'europa') {
            const list = ['Inglaterra', 'Itália', 'Espanha', 'França', 'Alemanha', 'Europa'];
            if (list.includes(pais)) return true;
            if (continente === 'UEFA') return true;
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
        if (normalizeYear(s.ano) !== normalizeYear(year)) return false
        
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
    background: #000;
}
.cursor-pointer { cursor: pointer; }

/* Wrapper centralizado (aprox meio da tela) */
.checklist-main-wrapper {
    max-width: 800px;
    width: 95%;
}

.header-year-premium {
    background: rgba(40, 40, 40, 0.4) !important;
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: all 0.2s;
}

.header-year-premium:hover {
    background: rgba(60, 60, 60, 0.6) !important;
    border-color: var(--bs-warning);
}

.slim-checklist-row {
    background: rgba(20, 20, 20, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.03);
    margin-bottom: 4px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
}

/* Efeito de Hover "Brabo" */
.slim-checklist-row:hover {
    background: rgba(255, 255, 255, 0.08) !important;
    transform: scale(1.01) translateX(5px);
    border-color: rgba(255, 255, 255, 0.15);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), 
                0 0 15px rgba(255, 255, 255, 0.05);
    z-index: 10;
}

/* Brilho lateral no hover */
.slim-checklist-row::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
        90deg, 
        transparent, 
        rgba(255, 255, 255, 0.05), 
        transparent
    );
    transition: 0.5s;
}

.slim-checklist-row:hover::before {
    left: 100%;
}

.row-registered {
    border-left: 4px solid var(--bs-success) !important;
}

.row-registered:hover {
    box-shadow: -5px 0 20px rgba(25, 135, 84, 0.2), 
                0 10px 30px rgba(0,0,0,0.5);
}

.row-pending {
    border-left: 4px solid rgba(220, 53, 69, 0.3) !important;
}

.row-pending:hover {
    border-left-color: var(--bs-danger) !important;
    box-shadow: -5px 0 20px rgba(220, 53, 69, 0.1), 
                0 10px 30px rgba(0,0,0,0.5);
}

/* Animação dos ícones de status no hover */
.slim-checklist-row:hover .status-icon-center i {
    transform: scale(1.2) rotate(5deg);
    filter: drop-shadow(0 0 8px currentColor);
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.slim-checklist-row:hover .comp-logo-img {
    transform: scale(1.1);
    filter: drop-shadow(0 0 10px rgba(255,255,255,0.3));
    transition: all 0.3s ease;
}

.comp-name-label {
    font-size: 0.85rem;
    letter-spacing: 0.5px;
}

.text-secondary-light {
    color: #999 !important; /* Muito mais legível que antes */
}

.comp-logo-img {
    width: 24px;
    height: 24px;
    object-fit: contain;
}

.comp-logo-box {
    width: 28px;
    display: flex;
    justify-content: center;
}

.status-icon-center {
    width: 35px;
    text-align: center;
    font-size: 1.1rem;
}

.status-final-box {
    width: 30px;
    display: flex;
    justify-content: center;
}

.animated-fade-in {
    animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
}

.truncate-100 {
    display: inline-block;
    max-width: 100px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.ls-2 { letter-spacing: 2px; }
.ls-1 { letter-spacing: 1px; }
.x-small { font-size: 0.6rem; }
.badge { font-size: 0.65rem; border-radius: 4px; }

/* DESTAQUE INTERNACIONAL (PEDIDO USUÁRIO) */
.intl-row-bg {
    background: rgba(0, 150, 255, 0.05) !important;
}
.intl-row-bg:hover {
    background: rgba(0, 150, 255, 0.12) !important;
}
</style>
