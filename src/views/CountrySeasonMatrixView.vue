<template>
  <div class="country-matrix-container p-2 min-vh-100 bg-dark text-white">
    <!-- TOOLBAR SUPERIOR -->
    <div class="d-flex justify-content-between align-items-center mb-3 px-3 py-2 bg-glass border-bottom border-white border-opacity-10 shadow-lg">
      <div class="d-flex align-items-center gap-4">
        <button @click="$router.push(`/pais/${countryId}/historico`)" class="btn btn-sm btn-action hover-glow px-3">
          <i class="bi bi-arrow-left me-2"></i>PAINEL ANTERIOR
        </button>
        <div class="d-flex align-items-center gap-2">
          <NationalFlag v-if="countryName" :countryName="countryName" :size="32" />
          <h4 class="m-0 text-uppercase fw-black ls-2 title-expert">MATRIZ EXPERT <span class="text-info opacity-50 ms-2">// {{ countryName }}</span></h4>
        </div>
      </div>
      
      <!-- FILTROS EXPERT -->
      <div class="d-flex align-items-center gap-2 bg-dark bg-opacity-50 p-1 rounded border border-white border-opacity-10">
        <span class="small fw-bold text-info ms-2 opacity-75">ORDENAR POR:</span>
        <select v-model="sortYear" class="form-select form-select-sm expert-select w-auto">
          <option value="">ALFABÉTICA</option>
          <option v-for="y in sortedSeasons" :key="y" :value="y">{{ y }}</option>
        </select>
        <select v-model="sortSlot" class="form-select form-select-sm expert-select w-auto" :disabled="!sortYear">
          <option v-for="slot in countrySlots" :key="slot.key" :value="slot.key">{{ slot.label }} {{ slot.type === 'intl' ? '(INTL)' : 'SÉRIE' }}</option>
        </select>
      </div>

      <LogoFREeFOOT :size="35" />
    </div>

    <!-- MENSAGENS DE STATUS -->
    <div v-if="seasonStore.loading" class="p-5 text-center">
      <div class="spinner-border text-info mb-3"></div>
      <p class="opacity-50 fw-bold">CARREGANDO DADOS DO UNIVERSO...</p>
    </div>
    <div v-else-if="sortedClubs.length === 0" class="p-5 text-center bg-black bg-opacity-40 rounded border border-white border-opacity-10 m-2">
      <i class="bi bi-exclamation-triangle fs-1 text-warning mb-3 d-block"></i>
      <h4 class="fw-black text-uppercase">Nenhum dado encontrado</h4>
      <p class="opacity-50">Não há registros de temporadas ou clubes vinculados a <strong>{{ countryName }}</strong> no momento.</p>
      <button @click="forceReload" class="btn btn-info btn-sm mt-3 fw-bold text-dark px-4">TENTAR RECARREGAR AGORA</button>
    </div>



    <!-- TABELA ESTILO EXCEL -->
    <div v-else class="matrix-xl-wrapper custom-scrollbar shadow-2xl border border-white border-opacity-10 rounded overflow-auto glass-table m-1">
      <table class="matrix-xl-table mb-0">
        <thead>
          <!-- LINHA 1: TEMPORADAS -->
          <tr>
            <th rowspan="3" class="sticky-club first-col-header bg-black text-center border-all">
              CLUBE
            </th>
            <th v-for="season in sortedSeasons" :key="'s'+season" :colspan="countrySlots.length" class="season-group-header border-all text-center">
              {{ season }}
            </th>
          </tr>

          <!-- LINHA 2: LOGOS / TÍTULOS DE COMPETIÇÃO -->
          <tr>
            <template v-for="season in sortedSeasons" :key="'l'+season">
              <!-- LIGA NACIONAL -->
              <th :colspan="ligaSlotsCount" class="bg-liga-header border-all text-center py-2">
                <div class="d-flex flex-column align-items-center gap-1">
                  <img v-if="mainLeagueLogo" :src="mainLeagueLogo" class="liga-header-logo" />
                  <span class="header-main-label" v-else>LIGA SÉRIE</span>
                </div>
              </th>
              <!-- INTERNACIONAIS -->
              <th v-for="intl in intlSlots" :key="season+intl.id" class="bg-intl-header border-all text-center py-1">
                <div class="d-flex flex-column align-items-center">
                  <img :src="intl.logo" class="intl-header-logo" v-tooltip="intl.name" />
                  <span class="intl-header-minor">{{ intl.shortName }}</span>
                </div>
              </th>
            </template>
          </tr>

          <!-- LINHA 3: SUB-DIVISÕES (A, B, C, D...) -->
          <tr>
            <template v-for="season in sortedSeasons" :key="'sd'+season">
              <th v-for="slot in countrySlots" :key="season+slot.key" class="slot-header border-all text-center px-0" :class="{ 'last-of-season': isLastSlot(slot) }">
                {{ slot.label }}
              </th>
            </template>
          </tr>
        </thead>

        <tbody>
          <tr v-for="club in sortedClubs" :key="club" class="club-row-xl">
            <!-- COLUNA FIXA: CLUBE -->
            <td class="sticky-club club-info-cell border-all px-2">
              <div class="d-flex align-items-center gap-2">
                <TeamShield :teamName="club" :size="20" />
                <span class="club-name-text">{{ club }}</span>
              </div>
            </td>

            <!-- CÉLULAS DE DADOS -->
            <template v-for="season in sortedSeasons" :key="club+season">
              <td v-for="slot in countrySlots" 
                  :key="club+season+slot.key" 
                  class="matrix-xl-cell border-all text-center"
                  :class="[getCellBackground(club, season, slot), { 'last-of-season': isLastSlot(slot) }]">
                 <span class="cell-rank-text">{{ getRank(club, season, slot) }}</span>
              </td>
            </template>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- LEGENDA EXPERT COMPACTA -->
    <div class="mt-2 d-flex flex-wrap gap-3 align-items-center small opacity-75 px-2">
      <div class="d-flex align-items-center gap-1">
        <div class="mini-box expert-gold-bg neon-border-gold" style="width: 12px; height: 12px;"></div> 
        <span>Campeão (A ou Intl)</span>
      </div>
      <div class="d-flex align-items-center gap-1">
        <div class="mini-box expert-silver-bg neon-border-silver" style="width: 12px; height: 12px;"></div> 
        <span>Vice / Top Ranking</span>
      </div>
      <div class="d-flex align-items-center gap-1">
        <div class="mini-box expert-green-bg" style="width: 12px; height: 12px; border: 1px solid #55ef44;"></div> 
        <span>Acesso / Elite</span>
      </div>
      <div class="d-flex align-items-center gap-1">
        <div class="mini-box expert-red-bg" style="width: 12px; height: 12px; border: 1px solid #ff5555;"></div> 
        <span>Rebaixado</span>
      </div>
      <div class="d-flex align-items-center gap-1">
        <div class="mini-box expert-blue-intl-bg" style="width: 12px; height: 12px; border: 1px solid #44d2ff;"></div> 
        <span>Participação Intl</span>
      </div>
      <div class="ms-auto opacity-50">{{ sortedClubs.length }} Clubes | {{ sortedSeasons.length }} Temporadas</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { seasonStore } from '../services/season.store'
import { CLUBS_DATA } from '../data/clubs.data'
import { ALL_COMPETITIONS_DATA } from '../services/competitions.data'
import { INTERNATIONAL_DATA } from '../data/internationalCompetitions'
import TeamShield from '../components/TeamShield.vue'
import NationalFlag from '../components/NationalFlag.vue'
import LogoFREeFOOT from '../components/LogoFREeFOOT.vue'

const route = useRoute()
const countryId = computed(() => route.params.id)

const countryName = computed(() => {
  const name = route.params.id || ''
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
})

const sortYear = ref('')
const sortSlot = ref('league_A')

// CONFIGURAÇÃO DE SLOTS (COLUNAS)
const countrySlots = ref([])
const intlSlots = [
  { id: 'liberta', key: 'intl_Libertadores', name: 'Libertadores', shortName: 'LIBERTADORES', logo: '/logos/competitions/libertadores.png' },
  { id: 'sula', key: 'intl_Sul-Americana', name: 'Sul-Americana', shortName: 'SUDAMERICANA', logo: '/logos/competitions/sulamericana.png' },
  { id: 'mundial', key: 'intl_Mundial de Clubes', name: 'Mundial de Clubes', shortName: 'MUNDIAL', logo: '/logos/competitions/mundial-de-clubes.png' }
]

const mainLeagueLogo = computed(() => {
  const countryIdVal = countryId.value?.toLowerCase()
  for (const continent of ALL_COMPETITIONS_DATA) {
    const p = continent.paises.find(p => p.nome.toLowerCase() === countryIdVal)
    if (p) {
      const liga = p.competicoes.find(c => c.tipo === 'Liga')
      return liga?.logo || null
    }
  }
  return null
})

const ligaSlotsCount = computed(() => countrySlots.value.filter(s => s.type === 'league').length)

const setupSlots = () => {
  const slots = []
  const countryIdVal = countryId.value?.toLowerCase()
  let leaguesFound = []
  
  // Buscar ligas deste país no sistema
  for (const continent of ALL_COMPETITIONS_DATA) {
     const p = continent.paises.find(p => p.nome.toLowerCase() === countryIdVal)
     if (p) {
       // Filtra apenas as Ligas (A, B, C, D...)
       leaguesFound = p.competicoes.filter(c => c.tipo === 'Liga')
       break
     }
  }

  // Ordenar por ID (geralmente A -> B -> C...)
  leaguesFound.sort((a, b) => (a.id || 0) - (b.id || 0))

  leaguesFound.forEach((liga, idx) => {
    const labels = ['A', 'B', 'C', 'D', 'E', 'F']
    slots.push({ 
      key: `league_${labels[idx] || (idx+1)}`, 
      label: labels[idx] || (idx+1), 
      type: 'league',
      meta: liga 
    })
  })

  intlSlots.forEach(i => {
    slots.push({ key: i.key, label: 'Pos', type: 'intl', id: i.id })
  })
  countrySlots.value = slots
}

// COLETA E PROCESSAMENTO DE DADOS (REATIVO)
const processedMatrix = computed(() => {
  const data = {}
  const seasonsSet = new Set()
  const clubsSet = new Set()
  
  // Normalização profunda para evitar erros de case/acentos
  const normalize = (s) => s?.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() || ""
  const countryIdVal = normalize(countryId.value)

  if (!seasonStore.list || seasonStore.list.length === 0) {
    return { data, seasons: [], clubs: [], empty: true }
  }

  // 1. Identificar clubes do país (Normalizado)
  const countryClubsNamesNormalized = CLUBS_DATA.filter(c => 
    normalize(c.pais) === countryIdVal
  ).map(c => normalize(c.nome))

  if (countryClubsNamesNormalized.length === 0) {
    return { data, seasons: [], clubs: [], noClubs: true }
  }

  // 2. Processar temporadas
  seasonStore.list.forEach(season => {
    if (!season.tabela || !season.competitionName) return
    
    const table = parseTable(season.tabela)
    const year = season.ano
    const compName = normalize(season.competitionName)

    table.forEach((row, index) => {
      const clubNameRaw = row.time
      const clubNameNorm = normalize(clubNameRaw)
      
      // FIX: Tentar obter rank real da coluna extra (para Copas desordenadas)
      let rank = index + 1
      if (row.extra) {
          const derivedRank = getRankFromExtra(row.extra)
          if (derivedRank !== 999) {
              rank = derivedRank
          }
      }

      // Verificação flexível
      if (!countryClubsNamesNormalized.includes(clubNameNorm)) return

      // Determinar Slot
      let slotKey = null
      
      // Ligas
      if (compName.includes('serie a') || compName.includes('primeira') || compName.includes('liga profissional') || compName.includes('liga inglesa')) slotKey = 'league_A'
      else if (compName.includes('serie b') || compName.includes('segunda') || compName.includes('nacional') || compName.includes('liga inglesa serie b')) slotKey = 'league_B'
      else if (compName.includes('serie c') || compName.includes('terceira')) slotKey = 'league_C'
      else if (compName.includes('serie d')) slotKey = 'league_D'
      
      // Internacionais
      intlSlots.forEach(intl => {
        const intlNorm = normalize(intl.name)
        const terms = intlNorm.split(' ')
        if (terms.some(t => t.length > 4 && compName.includes(t))) {
             slotKey = intl.key
        }
      })

      if (slotKey) {
        if (!data[clubNameRaw]) data[clubNameRaw] = {}
        if (!data[clubNameRaw][year]) data[clubNameRaw][year] = {}
        
        // Determinar se é ACESSO (Direto ou Playoff)
        let isAccess = false
        const compId = season.competitionId || (ALL_COMPETITIONS_DATA.flatMap(c => c.paises.flatMap(p => p.competicoes)).find(c => normalize(c.nome) === compName)?.id)
        const meta = ALL_COMPETITIONS_DATA.flatMap(c => c.paises.flatMap(p => p.competicoes)).find(c => c.id === compId)
        
        if (meta && meta.promovidos > 0) {
           const normPlayoffs = (season.promovidosPlayoff || []).map(p => normalize(p))
           const playoffCount = normPlayoffs.length
           const directCount = Math.max(0, meta.promovidos - playoffCount)
           
           isAccess = (rank <= directCount) || normPlayoffs.includes(clubNameNorm)
           
           if (compName.includes('nacional') && (rank <= 5)) {
              console.log(`DEBUG MATRIX [${clubNameRaw}]: Rank=${rank}, Direct=${directCount}, PlayoffCount=${playoffCount}, IsPlayoff=${normPlayoffs.includes(clubNameNorm)}, FinalAccess=${isAccess}`)
              console.log('NormPlayoffs:', normPlayoffs)
           }
        }

        // Determinar se é REBAIXAMENTO
        let isRelegation = false
        if (meta && meta.rebaixados > 0) {
           isRelegation = (rank > (table.length - meta.rebaixados))
        }

        if (!data[clubNameRaw][year][slotKey] || rank < data[clubNameRaw][year][slotKey].rank) {
          data[clubNameRaw][year][slotKey] = { 
            rank, 
            compName: season.competitionName,
            isAccess,
            isRelegation,
            debug_DirectCount: typeof directCount !== 'undefined' ? directCount : 'N/A',
            debug_PlayoffLen: typeof playoffCount !== 'undefined' ? playoffCount : 'N/A'
          }
        }
        
        clubsSet.add(clubNameRaw)
        seasonsSet.add(year)
      }
    })
  })

  // Ordenação de temporadas
  const sortedSeasonsList = Array.from(seasonsSet).sort((a, b) => {
    const aVal = parseInt(a.toString().split('/')[0]) || 0
    const bVal = parseInt(b.toString().split('/')[0]) || 0
    return aVal - bVal
  })

  // Ordenação de clubes (Personalizada por Filtro ou mais registros)
  const sortedClubsList = Array.from(clubsSet).sort((a, b) => {
    // Ordenação por Temporada/Slot de Referência
    if (sortYear.value && sortSlot.value) {
      const resA = data[a]?.[sortYear.value]?.[sortSlot.value]?.rank || 999
      const resB = data[b]?.[sortYear.value]?.[sortSlot.value]?.rank || 999
      
      if (resA !== resB) return resA - resB
    }

    const countA = Object.keys(data[a]).length
    const countB = Object.keys(data[b]).length
    if (countB !== countA) return countB - countA
    return a.localeCompare(b)
  })

  return { data, seasons: sortedSeasonsList, clubs: sortedClubsList }
})

// Atalhos reativos
const sortedSeasons = computed(() => processedMatrix.value.seasons)
const sortedClubs = computed(() => processedMatrix.value.clubs)
const matrixData = computed(() => processedMatrix.value.data)

const forceReload = () => seasonStore.loadAll()

// HELPERS (Robustos)
// HELPERS (Robustos)
const parseTable = (str) => {
    if (!str) return [];
    return str.split('\n').filter(l => l.trim()).map(line => {
        let cells = line.split('\t');
        if (cells.length === 1) cells = line.split(/\s{2,}/);
        
        let extra = '';

        // Tenta extrair nome se falhar regex padrão
        if (cells.length === 1) {
            const match = line.match(/^(\d+)?\.?\s*([^\d]+)(.*)$/)
            if (match) {
                 cells = [match[2].trim()]
                 extra = match[3]?.trim() || ''
            }
        }
        
        let teamName = cells[0]?.trim();
        // Se a primeira coluna for número, pega a segunda
        if (/^\d+$/.test(teamName) || /^\d+\.?$/.test(teamName)) {
            teamName = cells[1]?.trim();
            // Tenta pegar a terceira coluna como extra (status/colocação)
            if (cells[2]) extra = cells[2].trim();
        } else {
             // Se não tiver número no começo, a segunda coluna pode ser o extra
             if (cells[1]) extra = cells[1].trim();
        }

        return { time: teamName, extra };
    }).filter(x => x.time);
}

const getRankFromExtra = (extra) => {
    if (!extra) return 999;
    const e = extra.toUpperCase();
    if (e === 'CAMPEÃO' || e === 'CAMPEAO') return 1;
    if (e === 'VICE' || e === 'VICE-CAMPEÃO') return 2;
    if (e === 'SEMIFINAL' || e === 'SEMIFINAIS') return 4;
    if (e === 'QUARTAS' || e === 'QUARTAS DE FINAL') return 8;
    if (e === 'OITAVAS' || e === 'OITAVAS DE FINAL') return 16;
    if (e.includes('FASE DE GRUPOS') || e === 'GRUPOS') return 32;
    if (e.includes('PRÉ') || e.includes('PRE')) return 64;
    return 999;
}

const getCellExpertStyle = (club, season, slot) => {
  const result = matrixData.value[club]?.[season]?.[slot.key]
  if (!result) return ''

  const rank = result.rank
  const classes = []

  if (slot.type === 'league' && slot.meta) {
    const { promovidos, rebaixados, label } = slot.meta
    const isSerieA = slot.label === 'A'
    
    // CAMPEÃO (1º Lugar)
    if (rank === 1) {
      if (isSerieA) classes.push('expert-gold-bg', 'neon-border-gold')
      else classes.push('expert-green-bg', 'neon-border-gold')
    } 
    // ACESSO OU REBAIXAMENTO (DINÂMICO)
    else {
      if (result.isAccess) {
         if (rank === 2) classes.push('expert-green-bg', 'neon-border-silver')
         else classes.push('expert-green-bg')
      } else if (result.isRelegation) {
         // Verifica se existe uma próxima liga no countrySlots para mostrar rebaixamento
         const currentIdx = countrySlots.value.findIndex(s => s.key === slot.key)
         const hasLeagueBelow = countrySlots.value[currentIdx + 1]?.type === 'league'
         if (hasLeagueBelow) classes.push('expert-red-bg')
         else classes.push('expert-neutral-bg')
      } else {
         if (club.includes('RIVADAVIA')) {
             console.log('STYLE DEBUG: RIVADAVIA isAccess=FALSE. Applying neutral.')
         }
         classes.push('expert-neutral-bg')
      }
    }
  }

  if (slot.type === 'intl') {
    if (rank === 1) classes.push('expert-gold-bg', 'neon-border-gold')
    else if (rank === 2) classes.push('expert-silver-bg', 'neon-border-silver')
    else if (rank <= 8) classes.push('expert-green-bg')
    else classes.push('expert-blue-intl-bg')
  }

  return classes.join(' ')
}

const getRank = (club, season, slot) => {
  const result = matrixData.value[club]?.[season]?.[slot.key]
  if (!result) return ''
  
  const rank = result.rank
  if (slot.type === 'intl') {
    if (rank === 1) return '🏆 CAMP'
    if (rank === 2) return '🥈 VICE'
    if (rank === 4) return '🥉 SEMI'
    if (rank === 8) return 'QRT'
    if (rank === 16) return 'OIT'
    if (rank === 32) return 'GRP'
    if (rank === 64) return 'PRÉ'
    return rank + 'º'
  }
  return rank + 'º'
}

const getCellBackground = (club, season, slot) => {
  return getCellExpertStyle(club, season, slot)
}

const isLastSlot = (slot) => {
  if (countrySlots.value.length === 0) return false
  return slot.key === countrySlots.value[countrySlots.value.length - 1].key
}

onMounted(async () => {
  setupSlots()
  await seasonStore.loadAll()
})
</script>

<style scoped>
.country-matrix-container {
  background: radial-gradient(circle at 50% 50%, #1a1a2e 0%, #0c0c14 100%);
  position: relative;
  overflow: hidden;
}

.country-matrix-container::before {
  content: "";
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background-image: url("https://www.transparenttextures.com/patterns/carbon-fibre.png");
  opacity: 0.15;
  pointer-events: none;
}

.bg-glass {
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.title-expert {
  color: #fff;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.2);
}

.expert-select {
  background-color: rgba(0, 0, 0, 0.6);
  color: #fff;
  border-color: rgba(255, 255, 255, 0.2);
  font-weight: 800;
  font-size: 0.75rem;
  text-transform: uppercase;
}

.expert-select:focus {
  background-color: #000;
  color: #00f2ff;
  border-color: #00f2ff;
  box-shadow: 0 0 10px rgba(0, 242, 255, 0.3);
}

.glass-table {
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(5px);
}

.matrix-xl-wrapper {
  max-height: 82vh;
  box-shadow: 0 20px 50px rgba(0,0,0,0.5);
}

.matrix-xl-table {
  border-collapse: collapse;
  table-layout: fixed;
  color: #fff;
}

.border-all {
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.sticky-club {
  position: sticky;
  left: 0;
  z-index: 20;
  background: #0b0b13;
  min-width: 220px;
  width: 220px;
  border-right: 2px solid #00f2ff55 !important;
}

thead th {
  background: #151520;
  font-size: 0.75rem;
  color: #aaa;
}

.season-group-header {
  background: linear-gradient(180deg, #2a2a3e 0%, #151520 100%);
  padding: 8px;
  font-weight: 900;
  color: #fff;
  letter-spacing: 1px;
  border-bottom: 2px solid #000;
  min-width: 320px;
}

.bg-liga-header { 
  background: linear-gradient(180deg, #d4e1bc 0%, #b8cc9b 100%); 
  color: #1a3300; 
  font-weight: 900; 
  font-size: 1.1rem; 
  text-shadow: 0 1px 0 rgba(255,255,255,0.5);
  min-width: 150px;
}

.liga-header-logo {
  height: 45px;
  width: auto;
  object-fit: contain;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
}

.bg-intl-header { 
  background: linear-gradient(180deg, #4466aa 0%, #2f5597 100%); 
  color: #fff; 
  border-left: 1px solid rgba(255,255,255,0.2) !important;
}

.intl-header-logo { 
  height: 38px; 
  width: auto;
  object-fit: contain; 
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
}

.intl-header-minor { 
  font-size: 0.45rem; 
  font-weight: 950; 
  margin-top: 3px; 
  letter-spacing: 0.5px;
  opacity: 0.8;
}

.slot-header {
  font-size: 0.85rem;
  font-weight: 950;
  background: #0b0b13;
  color: #888;
  padding: 4px !important;
  width: 60px;
}

.matrix-xl-cell {
  height: 38px;
  max-height: 38px;
  font-size: 0.85rem;
  font-weight: 800;
  padding: 0 !important;
  vertical-align: middle;
  background: rgba(255, 255, 255, 0.02);
  transition: all 0.2s ease;
}

.cell-rank-text { display: block; }

.club-info-cell {
  background: #0b0b13;
  font-size: 0.85rem;
  font-weight: 800;
  letter-spacing: 0.3px;
}

.club-name-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Bordas de Separação de Temporada Neon */
.last-of-season {
  border-right: 4px solid #000 !important;
  position: relative;
}

.last-of-season::after {
  content: "";
  position: absolute;
  top: 0; right: -2px; width: 1px; height: 100%;
  background: rgba(0, 242, 255, 0.2);
}

/* Cores Estilo Expert (Neon e Vibrantes) */
.expert-gold-bg { 
  background: linear-gradient(135deg, #ffed4b 0%, #ffd700 100%) !important; 
  color: #332b00 !important; 
  font-weight: 950 !important;
}

.expert-silver-bg { 
  background: linear-gradient(135deg, #a0a0a0 0%, #707070 100%) !important; 
  color: #ffffff !important; 
  font-weight: 800 !important;
}

.expert-green-bg { 
  background: #28a74555 !important; 
  color: #55ef44 !important; 
  border: 1px solid rgba(40, 167, 69, 0.3) !important;
}

.expert-red-bg { 
  background: #dc354544 !important; 
  color: #ff5555 !important; 
  border: 1px solid rgba(220, 53, 69, 0.3) !important;
}

.expert-blue-intl-bg { 
  background: #0096ff22 !important; 
  color: #44d2ff !important; 
  border: 1px solid rgba(0, 150, 255, 0.3) !important;
}

.expert-neutral-bg {
  background: rgba(255,255,255,0.03);
  color: #666;
}

/* Bordas Neon */
.neon-border-gold {
  box-shadow: inset 0 0 12px #ffd700aa, 0 0 8px #ffd70088 !important;
  border: 1.5px solid #ffd700 !important;
  z-index: 5;
}

.neon-border-silver {
  box-shadow: inset 0 0 15px #ffffff, 0 0 10px #ffffffcc !important;
  border: 2px solid #ffffff !important;
  z-index: 4;
}

.neon-border-green {
  box-shadow: inset 0 0 10px #28a74588, 0 0 6px #28a74566 !important;
  border: 1.5px solid #28a745aa !important;
}

.club-row-xl:hover td {
  box-shadow: inset 0 0 0 999px rgba(255, 255, 255, 0.08) !important;
}

.club-row-xl:hover .club-info-cell {
  color: #00f2ff;
}

.mini-box { width: 14px; height: 14px; border-radius: 3px; }
.bg-gold-xl-leg { background: #ffd700; }
.bg-green-xl-leg { background: #28a745; }
.bg-red-xl-leg { background: #dc3545; }
.bg-blue-intl-xl-leg { background: #0096ff; }

.ls-2 { letter-spacing: 2px; }
.btn-action {
  background: rgba(0, 242, 255, 0.1);
  border: 1px solid #00f2ff44;
  color: #00f2ff;
  font-weight: 800;
  font-size: 0.75rem;
}

.btn-action:hover {
  background: #00f2ff;
  color: #000;
}

/* Custom Scrollbar */
.custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
.custom-scrollbar::-webkit-scrollbar-track { background: #0a0a10; }
.custom-scrollbar::-webkit-scrollbar-thumb { 
  background: #2a2a3e; 
  border-radius: 10px; 
  border: 2px solid #0a0a10; 
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #00f2ff88; }
</style>
