<script setup>
import { computed } from 'vue'
import TeamShield from './TeamShield.vue'
import { careerStore } from '../services/career.store'

const props = defineProps({
  data: {
    type: Array,
    required: true,
    default: () => []
  },
  promotedCount: {
    type: Number,
    default: 0
  },
  relegationCount: {
    type: Number,
    default: 0
  },
  fullWidth: {
    type: Boolean,
    default: true
  },
  playoffPromotedTeams: {
    type: Array,
    default: () => []
  },
  season: String // Necessário para marcar o time do usuário
})

// Helper para garantir que pegamos a célula correta mesmo que falte dado
// ... (omitted similar parts if using replace_file_content, but I need to be exact)
const getCell = (row, index) => {
  return row[index] !== undefined ? row[index] : '-'
}

// Lógica de Estatísticas (Melhores/Piores)
const statsExtremes = computed(() => {
  if (!props.data || props.data.length === 0) return {}

  const gpValues = props.data.map(r => parseInt(r[6]) || 0)
  const gcValues = props.data.map(r => parseInt(r[7]) || 0)

  // Filtramos 0 se necessário, mas geralmente tabelas vêm com dados reais
  return {
    maxGP: Math.max(...gpValues),
    minGP: Math.min(...gpValues),
    minGC: Math.min(...gcValues), // Melhor defesa (menos gols)
    maxGC: Math.max(...gcValues)  // Pior defesa (mais gols)
  }
})

const isBestAttack = (val) => {
  const v = parseInt(val)
  return statsExtremes.value.maxGP > 0 && v === statsExtremes.value.maxGP
}
const isWorstAttack = (val) => {
  const v = parseInt(val)
  return statsExtremes.value.minGP !== undefined && v === statsExtremes.value.minGP
}
const isBestDefense = (val) => {
  const v = parseInt(val)
  return statsExtremes.value.minGC !== undefined && v === statsExtremes.value.minGC
}
const isWorstDefense = (val) => {
  const v = parseInt(val)
  return statsExtremes.value.maxGC > 0 && v === statsExtremes.value.maxGC
}

const isAccessRow = (idx, teamName) => {
  if (idx === 0) return false // Campeão tem cor própria
  
  if (props.promotedCount <= 0) return false
  
  // Se está na lista manual de playoffs, é acesso com certeza
  if (props.playoffPromotedTeams.includes(teamName)) return true
  
  // Cálculo de vagas diretas restantes
  // Ex: PromovidosTotal=4, PromovidosPlayoff=2. Diretos = 4 - 2 = 2.
  // Então indices 1 e 2 sobem. Indice 3 (4º lugar) não.
  const directSpots = Math.max(0, props.promotedCount - props.playoffPromotedTeams.length)
  
  if (directSpots === 0) return false
  
  // Se não está no playoff manual, verificamos se cabe nas vagas diretas
  // Lembrando que idx 0 é o campeão (vaga 1).
  // Se directSpots = 2, então indices 0 e 1 sobem.
  // Mas como a função é chamada para idx > 0 (pois idx 0 é campeão),
  // Precisamos ver se o índice está dentro do limite.
  // Ex: Se directSpotos = 2.
  // idx 0 (Campeão/Direct1) -> False pq é campeão.
  // idx 1 (Vice/Direct2) -> True.
  // idx 2 (3º lugar) -> False (pois só tinham 2 diretas).
  return idx < directSpots
}
</script>

<template>
  <div class="tv-table-wrapper" :class="{ 'full-width': fullWidth }">
    <div class="table-responsive custom-scrollbar">
      <div class="tv-league-table-v2">
        
        <!-- Cabeçalho (Inclinado) -->
        <div class="tv-header-v2">
          <div class="h-main-v2">
            <div class="h-pos-v2">#</div>
            <div class="h-team-v2">CLASSIFICAÇÃO</div>
          </div>
          <div class="h-stats-v2">
            <div class="h-slant pts">P</div>
            <div class="h-slant">J</div>
            <div class="h-slant">V</div>
            <div class="h-slant">E</div>
            <div class="h-slant">D</div>
            <div class="h-slant gp">GP</div>
            <div class="h-slant gc">GC</div>
            <div class="h-slant sg">SG</div>
            <div class="h-slant perc">%</div>
          </div>
        </div>

        <!-- Linhas (Ultra-Compactas 30px) -->
        <div v-for="(row, idx) in data" :key="idx" 
             class="tv-row-v2"
             :class="{
               'linha-campeao': idx === 0,
               'linha-acesso': isAccessRow(idx, row[0]),
               'linha-rebaixado': relegationCount > 0 && idx >= data.length - relegationCount,
               'row-alt-v2': idx % 2 !== 0
             }">

          
          <!-- Rank Inclinado -->
          <div class="rank-slant-v2" :class="{ 
            'bg-champion': idx === 0, 
            'bg-relegation': relegationCount > 0 && idx >= data.length - relegationCount 
          }">
            <span>{{ idx + 1 }}</span>
          </div>

          <!-- Escudo e Nome -->
          <div class="team-info-v2">
            <TeamShield :teamName="row[0]" :size="24" borderless :season="season" />
            <span class="team-name-v2 text-truncate">{{ row[0] }}</span>
            <i v-if="careerStore.isUserTeam(row[0], season)" class="bi bi-controller ms-1 text-neon-green pulse-neon"></i>
          </div>

          <!-- Estatísticas (Juntas e Inclinadas) -->
          <div class="stats-group-v2">
            <div class="stat-slant-v2 pts-v2"><span>{{ getCell(row, 2) }}</span></div>
            <div class="stat-slant-v2"><span>{{ getCell(row, 1) }}</span></div>
            <div class="stat-slant-v2"><span>{{ getCell(row, 3) }}</span></div>
            <div class="stat-slant-v2"><span>{{ getCell(row, 4) }}</span></div>
            <div class="stat-slant-v2"><span>{{ getCell(row, 5) }}</span></div>
            
            <!-- Ataque (GP) -->
            <div class="stat-slant-v2 gp" 
                 :class="{ 
                   'best-stat': isBestAttack(row[6]), 
                   'worst-stat': isWorstAttack(row[6]) 
                 }">
              <span>{{ getCell(row, 6) }}</span>
            </div>
            
            <!-- Defesa (GC) -->
            <div class="stat-slant-v2 gc"
                 :class="{ 
                   'best-stat': isBestDefense(row[7]), 
                   'worst-stat': isWorstDefense(row[7]) 
                 }">
              <span>{{ getCell(row, 7) }}</span>
            </div>
            
            <div class="stat-slant-v2 sg"><span>{{ getCell(row, 8) }}</span></div>
            <div class="stat-slant-v2 perc"><span>{{ getCell(row, 9) }}</span></div>
            
            <!-- Badge de Controle (Fim da Linha) -->
            <div v-if="careerStore.isUserTeam(getCell(row, 1), season)" class="stat-slant-v2 tray-icon-user">
                <i class="bi bi-controller text-neon-green"></i>
            </div>
          </div>

        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.tv-table-wrapper {
  padding: 0.2rem 0;
  font-family: 'Inter', 'Segoe UI', sans-serif;
  color: #fff;
  display: inline-block;
}

.tv-table-wrapper.full-width { width: auto; }

.table-responsive {
  width: auto;
  overflow-x: auto;
  padding-bottom: 5px;
}

.tv-league-table-v2 {
  width: 550px; /* Reduzido de 650px para caber na SeasonDetail */
  display: flex;
  flex-direction: column;
  gap: 1px;
}

/* HEADER STYLE */
.tv-header-v2 {
  display: flex;
  align-items: flex-end;
  margin-bottom: 3px;
}

.h-main-v2 {
  display: flex;
  width: 220px; /* Reduzido de 280px */
  font-weight: 900;
  font-size: 0.65rem;
  letter-spacing: 1.5px;
  color: rgba(255, 255, 255, 0.4);
  text-transform: uppercase;
}

.h-pos-v2 { width: 40px; text-align: center; }
.h-team-v2 { padding-left: 10px; }

.h-stats-v2 {
  display: flex;
  gap: 1.5px;
}

.h-slant {
  width: 32px; /* Reduzido de 36px */
  height: 18px;
  background: rgba(255, 255, 255, 0.05);
  transform: skewX(-20deg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.6rem;
  font-weight: 900;
  color: rgba(255, 255, 255, 0.5);
}

.h-slant.pts { width: 40px; background: rgba(88, 204, 255, 0.1); } /* Reduzido de 45 */
.h-slant.gp, .h-slant.gc, .h-slant.sg { width: 30px; } /* Reduzido de 34 */
.h-slant.perc { width: 36px; } /* Reduzido de 42 */

/* ROW STYLE */
.tv-row-v2 {
  display: flex;
  align-items: stretch;
  background: rgba(15, 25, 40, 0.85);
  height: 30px;
  position: relative;
  transition: all 0.2s;
}

.tv-row-v2:hover {
  background: rgba(30, 50, 90, 0.9) !important;
}

/* NOVOS ESTILOS DE DESTAQUE */
.linha-campeao {
  background: linear-gradient(90deg, rgba(255,215,0,0.15), transparent) !important;
  border-left: 3px solid #FFD700;
}

.linha-acesso {
  background: linear-gradient(90deg, rgba(0,255,150,0.12), transparent) !important;
  border-left: 3px solid #00ff95;
}

.linha-rebaixado {
  background: linear-gradient(90deg, rgba(255,0,0,0.15), transparent) !important;
  border-left: 3px solid #ff2b2b;
}

/* HOVER PARA LINHAS DESTACADAS */
.linha-campeao:hover,
.linha-acesso:hover,
.linha-rebaixado:hover {
  transform: scale(1.01);
  filter: brightness(1.15);
  z-index: 10;
}

.row-alt-v2 {
  background: rgba(10, 18, 30, 0.5);
}

/* RANK SLANT */
.rank-slant-v2 {
  width: 40px;
  background: rgba(0, 0, 0, 0.4);
  transform: skewX(-20deg);
  margin-left: -7px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.7);
  z-index: 2;
}

.rank-slant-v2 span {
  transform: skewX(20deg);
}

/* TEAM IDENT */
.team-info-v2 {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-left: 15px;
  width: 180px; /* Reduzido para match com h-main (220 - 40) */
  z-index: 1;
}

.team-name-v2 {
  font-weight: 800;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

/* STATS GROUP */
.stats-group-v2 {
  display: flex;
  gap: 1.5px;
  margin-right: -10px;
}

.stat-slant-v2 {
  width: 32px; /* Compatível com h-slant */
  background: rgba(0, 0, 0, 0.2);
  transform: skewX(-20deg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 0.9rem;
}

.stat-slant-v2 span {
  transform: skewX(20deg);
  display: block;
}

/* PTS */
.pts-v2 {
  width: 40px; /* Compatível com h-slant.pts */
  background: rgba(0, 0, 0, 0.4);
  color: #58ccff;
  font-size: 1.1rem;
  font-weight: 900;
}

/* STATUS COLORS FOR NUMBERS */
.best-stat span { color: #00ff88 !important; text-shadow: 0 0 10px rgba(0, 255, 136, 0.4); }
.worst-stat span { color: #ff4444 !important; text-shadow: 0 0 10px rgba(255, 68, 68, 0.4); }

/* Ajuste de cor para rebaixados no PTS */
.linha-rebaixado .pts-v2 {
  color: #ff9999;
}

.stat-slant-v2.gp, .stat-slant-v2.gc, .stat-slant-v2.sg { width: 30px; font-size: 0.75rem; }
.stat-slant-v2.perc { width: 36px; font-size: 0.75rem; opacity: 0.6; }

.text-neon-green {
  color: #39ff14;
  text-shadow: 0 0 10px rgba(57, 255, 20, 0.8), 0 0 18px rgba(57, 255, 20, 0.4);
  font-size: 1.1rem;
}

.pulse-neon {
  animation: pulse-neon-anim 2s infinite;
}

@keyframes pulse-neon-anim {
  0% { opacity: 0.7; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
  100% { opacity: 0.7; transform: scale(1); }
}

/* ESPECIAL HIGHLIGHTS (Fundos originais para os ranks) */
.bg-champion {
  background: linear-gradient(135deg, #ffc107 0%, #b8860b 100%) !important;
  color: #000 !important;
}

.bg-relegation {
  background: linear-gradient(135deg, #cc1111 0%, #550000 100%) !important;
  color: #fff !important;
}

/* CUSTOM SCROLLBAR */
.custom-scrollbar::-webkit-scrollbar { height: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 4px; }
</style>
