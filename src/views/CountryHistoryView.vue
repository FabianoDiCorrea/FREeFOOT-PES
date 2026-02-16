<template>
  <div class="view-container animated-fade-in">
    <div class="d-flex justify-content-between align-items-center mb-4 px-2 position-relative py-3 overflow-hidden rounded-3 header-country-box">
      <!-- Bandeira de Fundo Translúcida -->
      <div class="country-bg-flag" v-if="countryFlagUrl" :style="{ backgroundImage: `url(${countryFlagUrl})` }"></div>
      
      <div class="d-flex align-items-center gap-3 position-relative" style="z-index: 2;">
        <button @click="$router.push('/universo')" class="btn btn-outline-light btn-sm border-opacity-25 bg-black bg-opacity-20 hover-glow">
          <i class="bi bi-arrow-left me-2"></i>VOLTAR
        </button>
        <h2 class="m-0 text-uppercase fw-black d-flex align-items-center gap-3 header-title-main" v-if="countryName">
          <NationalFlag :countryName="countryName" :size="45" class="shadow-lg border border-white border-opacity-20" />
          <span class="text-white">HISTÓRICO - {{ countryName }}</span>
        </h2>
      </div>
      <LogoFREeFOOT style="z-index: 2;" />
    </div>

     <div class="px-2 mb-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div class="d-flex align-items-center gap-2">
          <label class="text-secondary small fw-bold text-uppercase opacity-75">ORDENAR POR:</label>
          <select v-model="sortBy" class="form-select form-select-sm bg-dark text-white border-secondary border-opacity-25 fw-bold" style="width: 200px;">
            <option value="total">Total de Títulos</option>
            <option v-for="comp in nationalCompetitions" :key="comp.nome" :value="'nat_' + comp.nome">
              {{ comp.nome }}
            </option>
            <option value="libertadores">Libertadores</option>
            <option value="sudamericana">Sul-Americana</option>
            <option value="mundial">Mundial</option>
            <option value="relegations">Rebaixamentos</option>
          </select>
        </div>

        <button @click="$router.push(`/pais/${countryName}/matriz`)" class="btn btn-info btn-sm fw-black text-dark px-3 hover-glow border-0 shadow-sm" style="background: #00f2ff;">
          <i class="bi bi-calendar3 me-2"></i>VER MATRIZ DE TEMPORADAS
        </button>
     </div>

    <GamePanel customClass="p-0 overflow-hidden shadow-lg border border-secondary border-opacity-10 bg-black bg-opacity-20">
      <!-- Container 'Quadro de Honra' removido conforme solicitação -->
      
      <div class="table-responsive custom-scrollbar py-1">
        <table class="table table-dark align-middle mb-0" style="font-size: 0.7rem; border-collapse: separate; border-spacing: 0 4px;">
          <thead class="bg-black bg-opacity-80">
            <!-- LINHA DE LOGOS DAS COMPETIÇÕES (ESTILO ELITE) -->
            <tr class="row-competicoes-logos border-bottom border-white border-opacity-10">
              <th colspan="2" class="py-1 bg-black bg-opacity-80"></th>
              <!-- Logos Nacionais -->
              <th v-for="comp in nationalCompetitions" :key="'logo_' + comp.nome" class="py-1 border-start border-black border-opacity-10">
                <div class="logo-comp-container">
                  <img :src="comp.logo" :alt="comp.nome" class="logo-comp-img" v-if="comp.logo" />
                  <span v-else class="text-dark opacity-25 x-small">{{ comp.nome.split(' ')[0] }}</span>
                </div>
              </th>
              <!-- Movimento (Dinamizado por existência de ligas) -->
              <template v-if="['Brasil', 'Argentina', 'Inglaterra'].includes(countryName)">
                <th :colspan="movementColspan" class="py-1 border-start border-black border-opacity-10 align-middle text-center">
                  <span class="fw-black ls-1 text-dark opacity-70" style="font-size: 0.9rem;">ACESSOS E REBAIXAMENTOS</span>
                </th>
              </template>
              <!-- Internacionais -->
              <th :class="{ 'border-start border-black border-opacity-10': !['Brasil', 'Argentina', 'Inglaterra'].includes(countryName) }" class="py-1 border-none align-middle">
                <div class="logo-comp-container">
                  <img src="/logos/competitions/libertadores.png" class="logo-comp-img mini" />
                </div>
              </th>
              <th class="py-1 border-none align-middle">
                <div class="logo-comp-container">
                  <img src="/logos/competitions/libertadores.png" class="logo-comp-img" />
                </div>
              </th>
              <th class="py-1 border-none align-middle">
                <div class="logo-comp-container">
                  <img src="/logos/competitions/sulamericana.png" class="logo-comp-img mini" />
                </div>
              </th>
              <th class="py-1 border-none align-middle">
                <div class="logo-comp-container">
                  <img src="/logos/competitions/sulamericana.png" class="logo-comp-img" />
                </div>
              </th>
              <th class="py-1 border-none align-middle px-1">
                <div class="logo-comp-container">
                  <img src="/logos/competitions/mundial-de-clubes.png" class="logo-comp-img" />
                </div>
              </th>
              <!-- REMOVIDO: th condicional com ícone bi-caret-down-fill que causava duplicação visual -->
            </tr>
            <tr class="text-secondary opacity-70 x-small text-uppercase text-center fw-black border-bottom border-secondary border-opacity-10">
              <th class="text-start ps-1 align-middle bg-black bg-opacity-30" style="width: 120px; min-width: 120px;">CLUBE</th>
              <th class="text-warning-neon align-middle px-1 py-1 header-cell-neon col-total-titulos" style="width: 55px;">TOTAL<br>TÍTULOS</th>
              <th v-for="comp in nationalCompetitions" :key="comp.nome" style="width: 75px;" class="align-middle px-1 py-1 header-cell-neon border-start border-white border-opacity-5">
                <div v-html="formatHeader(comp.nome)" class="lh-1"></div>
              </th>
              <template v-if="['Brasil', 'Argentina', 'Inglaterra'].includes(countryName)">
                <th class="text-danger-neon align-middle px-1 py-1 header-cell-neon border-start border-white border-opacity-10 col-relegation" style="width: 60px;">QUEDA<br>DIV. 1</th>
                <th class="text-success-neon align-middle px-1 py-1 header-cell-neon col-access" style="width: 60px;">SUBIDA<br>DIV. 1</th>
                <th v-if="hasSerieC" class="text-danger-neon align-middle px-1 py-1 header-cell-neon col-relegation" style="width: 60px;">QUEDA<br>DIV. 2</th>
                <th v-if="hasSerieC" class="text-success-neon align-middle px-1 py-1 header-cell-neon col-access" style="width: 60px;">SUBIDA<br>DIV. 2</th>
                <th v-if="hasSerieD" class="text-danger-neon align-middle px-1 py-1 header-cell-neon col-relegation" style="width: 60px;">QUEDA<br>DIV. 3</th>
                <th v-if="hasSerieD" class="text-success-neon align-middle px-1 py-1 header-cell-neon col-access" style="width: 60px;">SUBIDA<br>DIV. 3</th>
              </template>
              <th class="text-info-neon align-middle px-1 py-1 header-cell-neon border-start border-white border-opacity-10" style="width: 65px;">LIBERTA<br>CLASS.</th>
              <th class="text-warning-neon align-middle px-1 py-1 header-cell-neon" style="width: 65px;">LIBERTA<br>TÍTULO</th>
              <th class="text-info-neon align-middle px-1 py-1 header-cell-neon" style="width: 65px;">SUL-AM.<br>CLASS.</th>
              <th class="text-warning-neon align-middle px-1 py-1 header-cell-neon" style="width: 65px;">SUL-AM.<br>TÍTULO</th>
              <th class="text-warning-neon align-middle px-1 py-1 header-cell-neon" style="width: 60px;">MUNDIAL<br>TÍTULO</th>
              <!-- REMOVIDO: th genérico de REBAIXAMENTOS que causava duplicação na Argentina -->
            </tr>
          </thead>
          <tbody>
            <tr v-for="club in sortedClubs" :key="club.nome" class="club-row">
              <td class="ps-1 fw-black text-uppercase border-none">
                <div class="d-flex align-items-center gap-1">
                  <TeamShield :teamName="club.nome" :size="20" />
                  <span class="name-cell-full">{{ club.nome }}</span>
                </div>
              </td>

              <!-- CÉLULA TOTAL -->
              <td class="text-center px-1 fw-black text-warning-neon col-total-titulos" :data-value="calculateTotalTitles(club)">
                <span class="stat-badge">{{ calculateTotalTitles(club) || '' }}</span>
              </td>
              
              <!-- CÉLULAS NACIONAIS -->
              <td v-for="comp in nationalCompetitions" :key="comp.nome + club.nome" class="text-center px-1" :data-value="club.stats.national[comp.nome]">
                <span class="stat-badge" :class="{ 'text-neon-gold': club.stats.national[comp.nome] > 0 }">
                  {{ club.stats.national[comp.nome] || '' }}
                </span>
              </td>

              <!-- CÉLULAS MOVIMENTO (BR, AR, EN) -->
              <template v-if="['Brasil', 'Argentina', 'Inglaterra'].includes(countryName)">
                <td class="text-center px-1 fw-black text-danger-neon col-relegation" :data-value="club.stats.relegation_A_B"><span class="stat-badge">{{ club.stats.relegation_A_B || '' }}</span></td>
                <td class="text-center px-1 fw-black text-success-neon col-access" :data-value="club.stats.access_B_A"><span class="stat-badge">{{ club.stats.access_B_A || '' }}</span></td>
                <td v-if="hasSerieC" class="text-center px-1 fw-black text-danger-neon col-relegation" :data-value="club.stats.relegation_B_C"><span class="stat-badge">{{ club.stats.relegation_B_C || '' }}</span></td>
                <td v-if="hasSerieC" class="text-center px-1 fw-black text-success-neon col-access" :data-value="club.stats.access_C_B"><span class="stat-badge">{{ club.stats.access_C_B || '' }}</span></td>
                <td v-if="hasSerieD" class="text-center px-1 fw-black text-danger-neon col-relegation" :data-value="club.stats.relegation_C_D"><span class="stat-badge">{{ club.stats.relegation_C_D || '' }}</span></td>
                <td v-if="hasSerieD" class="text-center px-1 fw-black text-success-neon col-access" :data-value="club.stats.access_D_C"><span class="stat-badge">{{ club.stats.access_D_C || '' }}</span></td>
              </template>

              <!-- CÉLULAS INTERNACIONAIS -->
              <td class="text-center px-1 fw-black text-info-neon" :data-value="club.stats.part_libertadores">
                <span class="stat-badge">{{ club.stats.part_libertadores || '' }}</span>
              </td>
              <td class="text-center px-1 fw-black text-neon-gold" :data-value="club.stats.libertadores">
                <span class="stat-badge">{{ club.stats.libertadores || '' }}</span>
              </td>
              <td class="text-center px-1 fw-black text-info-neon" :data-value="club.stats.part_sudamericana">
                <span class="stat-badge">{{ club.stats.part_sudamericana || '' }}</span>
              </td>
              <td class="text-center px-1 fw-black text-neon-gold" :data-value="club.stats.sudamericana">
                <span class="stat-badge">{{ club.stats.sudamericana || '' }}</span>
              </td>
              <td class="text-center px-1 fw-black text-neon-gold" :data-value="club.stats.mundial">
                <span class="stat-badge">{{ club.stats.mundial || '' }}</span>
              </td>

              <!-- REMOVIDO: td genérico de REBAIXAMENTOS -->
            </tr>
             <tr v-if="countryClubs.length === 0">
              <td :colspan="nationalCompetitions.length + (['Brasil', 'Argentina', 'Inglaterra'].includes(countryName) ? movementColspan + 5 : 7)" class="text-center py-5 opacity-25 fw-black text-uppercase fs-5">
                Nenhum registro encontrado para este país.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </GamePanel>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { CLUBS_DATA } from '../data/clubs.data'
import { seasonStore } from '../services/season.store'
import { SOUTH_AMERICA_DATA, EUROPE_DATA, CONCACAF_DATA, ALL_COMPETITIONS_DATA } from '../services/competitions.data'
import { INTERNATIONAL_DATA } from '../data/internationalCompetitions'
import GamePanel from '../components/GamePanel.vue'
import TeamShield from '../components/TeamShield.vue'
import NationalFlag from '../components/NationalFlag.vue'
import LogoFREeFOOT from '../components/LogoFREeFOOT.vue'

const route = useRoute()
const countryName = ref('')
const countryClubs = ref([])

const hasSerieC = computed(() => nationalCompetitions.value.length >= 3)
const hasSerieD = computed(() => nationalCompetitions.value.length >= 4)
const movementColspan = computed(() => {
  let count = 2
  if (hasSerieC.value) count += 2
  if (hasSerieD.value) count += 2
  return count
})

// Helper para pegar o nome da liga/competição e saber se é internacional ou qual divisão
const getCompetitionInfo = (compName) => {
  if (!compName || !ALL_COMPETITIONS_DATA) return { type: 'unknown' };
  const cName = compName.toLowerCase().trim();

  // Verifica Internacionais
  const isInt = INTERNATIONAL_DATA?.some(c => c.nome?.toLowerCase().trim() === cName);
  if (isInt) return { type: 'international' };

  // Verifica Nacionais
  let found = null;
  ALL_COMPETITIONS_DATA.forEach(cont => {
     if (cont && cont.paises) {
        cont.paises.forEach(p => {
           if (p && p.competicoes) {
              p.competicoes.forEach(c => {
                 if (c && c.nome && c.nome.toLowerCase().trim() === cName) {
                   found = c;
                 }
              })
           }
        })
     }
  })
  
  return found || { type: 'unknown' };
}

const nationalCompetitions = ref([])
const sortBy = ref('total')

const countryFlagUrl = computed(() => {
  if (!countryName.value) return null;
  const allContinents = [SOUTH_AMERICA_DATA, EUROPE_DATA, CONCACAF_DATA];
  for (const cont of allContinents) {
    if (cont && cont.paises) {
      const c = cont.paises.find(p => normalizeName(p.nome) === normalizeName(countryName.value));
      if (c) return c.bandeira;
    }
  }
  return null;
})

const formatHeader = (name) => {
  if (!name) return '';
  return String(name).replace('Brasileirão ', 'Brasileirão<br>')
                    .replace('Série ', 'Série ')
                    .replace('Copa do Brasil', 'Copa do<br>Brasil')
                    .replace('Supercopa do Brasil', 'Supercopa<br>Brasil')
                    .replace('Copa do ', 'Copa do<br>');
}

// Helper para normalizar nomes de clubes (remover acentos e espaços extras)
const normalizeName = (name) => {
    if (!name) return '';
    return name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

const loadData = async () => {
    const routeId = route.params.id;
    const pNome = decodeURIComponent(routeId);
    countryName.value = pNome;

    // 0. Carregar TODAS as temporadas do banco (evita dados parciais na store)
    await seasonStore.loadAll();

    // 1. Carregar Competições do País
    const allContinents = [SOUTH_AMERICA_DATA, EUROPE_DATA, CONCACAF_DATA];
    let foundCountry = null;

    for (const cont of allContinents) {
        if (cont && cont.paises) {
            const c = cont.paises.find(p => normalizeName(p.nome) === normalizeName(pNome));
            if (c) {
                foundCountry = c;
                break;
            }
        }
    }

    if (foundCountry) {
        // Garantir filtro limpo por tipo Liga, mas incluindo Copas chave para o Brasil
        nationalCompetitions.value = (foundCountry.competicoes || []).filter(c => {
            if (c.tipo === 'Liga') return true;
            if (normalizeName(foundCountry.nome) === 'brasil') {
                const n = normalizeName(c.nome);
                if (n === 'copa do brasil' || n === 'supercopa do brasil') return true;
            }
            return false;
        });
    }

    // 2. Carregar Clubes e Inicializar Stats
    const clubsData = CLUBS_DATA.filter(c => c.pais && normalizeName(c.pais) === normalizeName(pNome));
    
    const statsMap = {};
    clubsData.forEach(c => {
        statsMap[c.nome] = {
            national: {},
            libertadores: 0,
            part_libertadores: 0,
            sudamericana: 0,
            part_sudamericana: 0,
            mundial: 0,
            part_mundial: 0,
            relegations: 0,
            // Específicos Brasil
            relegation_A_B: 0,
            access_B_A: 0,
            relegation_B_C: 0,
            access_C_B: 0,
            relegation_C_D: 0,
            access_D_C: 0
        };
        nationalCompetitions.value.forEach(nc => {
            statsMap[c.nome].national[nc.nome] = 0;
        });
    });

    const getStatsKey = (name) => {
        const norm = normalizeName(name);
        return Object.keys(statsMap).find(key => normalizeName(key) === norm);
    };

    // 3. Processar Temporadas (Com trava de unicidade por ID)
    const processedSeasons = new Set();
    seasonStore.list.forEach(season => {
        // Ignora se for uma temporada duplicada (mesmo ID)
        const seasonId = season.id || `${season.competitionName}-${season.ano}`;
        if (processedSeasons.has(seasonId)) return;
        processedSeasons.add(seasonId);

        const compName = season.competitionName;
        const compInfo = getCompetitionInfo(compName);
        const campeaoNorm = getStatsKey(season.campeao);

        // --- TÍTULOS NACIONAIS ---
        const isNational = nationalCompetitions.value.find(nc => normalizeName(nc.nome) === normalizeName(compName));
        if (isNational && campeaoNorm) {
            statsMap[campeaoNorm].national[isNational.nome]++;
        }

        // --- INTERNACIONAIS (Títulos e Participações) ---
        if (compInfo && compInfo.type === 'international') {
            const cLow = normalizeName(compName);
            const isLib = cLow.includes('libertadores');
            const isSula = cLow.includes('sul-americana') || cLow.includes('sudamericana');
            const isMundial = cLow.includes('mundial') || cLow.includes('intercontinental');

            // Títulos
            if (campeaoNorm) {
                if (isLib) statsMap[campeaoNorm].libertadores++;
                else if (isSula) statsMap[campeaoNorm].sudamericana++;
                else if (isMundial) statsMap[campeaoNorm].mundial++;
            }

            // Participações (Contar todos os times com colocação salva/na tabela)
            // O usuário mencionou: "se o mesmo clube jogar Libert e Sula na mesma temporada, deve somar nas duas"
            // Como cada competição é uma entrada separada no seasonStore, isso acontece naturalmente.
            if (season.tabela) {
                const teamsInSeason = parseTable(season.tabela).map(t => t.time);
                teamsInSeason.forEach(teamName => {
                    const tNorm = getStatsKey(teamName);
                    if (tNorm) {
                        if (isLib) statsMap[tNorm].part_libertadores++;
                        else if (isSula) statsMap[tNorm].part_sudamericana++;
                        else if (isMundial) statsMap[tNorm].part_mundial++;
                    }
                });
            }
        }

        // --- ACESSOS E REBAIXAMENTOS (BR, AR, EN) ---
        if (['brasil', 'argentina', 'inglaterra'].includes(normalizeName(countryName.value)) && season.tabela) {
             const items = parseTable(season.tabela);
             const cNameLow = compName.toLowerCase();

             // ACESSOS (PROMOÇÕES)
             const isB = cNameLow.includes('série b') || cNameLow.includes('nacional') || cNameLow.includes('liga inglesa série b')
             const isC = cNameLow.includes('série c')
             const isD = cNameLow.includes('série d')

             if (isB) {
                 getPromotedTeams(season, items, compInfo).forEach(t => {
                     const key = getStatsKey(t);
                     if (key) statsMap[key].access_B_A++;
                 });
             } else if (isC) {
                 getPromotedTeams(season, items, compInfo).forEach(t => {
                     const key = getStatsKey(t);
                     if (key) statsMap[key].access_C_B++;
                 });
             } else if (isD) {
                 getPromotedTeams(season, items, compInfo).forEach(t => {
                     const key = getStatsKey(t);
                     if (key) statsMap[key].access_D_C++;
                 });
             }

             // REBAIXAMENTOS (Série A, B, C -> Últimos X)
             const isSerieA = cNameLow.includes('série a') || cNameLow.includes('profissional') || cNameLow.includes('primera division') || cNameLow.includes('liga inglesa')
             const isSerieB = cNameLow.includes('série b') || cNameLow.includes('nacional') || cNameLow.includes('liga inglesa série b')
             const isSerieC = cNameLow.includes('série c')

             const nRebaixados = compInfo.rebaixados || 0
             if ((isSerieA || isSerieB || isSerieC) && nRebaixados > 0 && items.length >= nRebaixados) {
                 const dropped = items.slice(-nRebaixados);
                 dropped.forEach(t => {
                     const key = getStatsKey(t.time);
                     if (key) {
                         if (isSerieA) statsMap[key].relegation_A_B++;
                         else if (isSerieB) statsMap[key].relegation_B_C++;
                         else if (isSerieC) statsMap[key].relegation_C_D++;
                     }
                 });
             }
            // Rebaixamentos gerais para outros países (APAGADO: conforme pedido do usuário para focar apenas em BR, AR, EN)
             /* 
             const items = parseTable(season.tabela);
             let nRelegated = compInfo.rebaixados || 0;
             if (compName === 'Liga Profissional' || compName === 'Liga Argentina' || compName === 'Primera División') nRelegated = 4;

             if (nRelegated > 0 && items.length > 0) {
                 items.slice(-nRelegated).forEach(t => {
                     const key = getStatsKey(t.time);
                     if (key) statsMap[key].relegations++;
                 });
             }
             */
        }
    });

    countryClubs.value = Object.keys(statsMap).map(key => ({
        nome: key,
        stats: statsMap[key]
    }));
}

// Helpers Extraídos para limpeza
const parseTable = (tableStr) => {
    if (!tableStr) return [];
    return tableStr.split('\n').filter(l => l.trim()).map(line => {
        let cells = line.split('\t');
        if (cells.length === 1) cells = line.split(/\s{2,}/);
        
        let time = cells[0]?.trim();
        
        // Se a primeira coluna for número (pos), pega a segunda (time)
        if (/^\d+$/.test(time) || /^\d+\.?$/.test(time)) {
            time = cells[1]?.trim();
        }

        // Fallback regex para linhas mal formatadas
        if (!time && cells.length === 1) {
            const match = line.match(/^(\d+)?\.?\s*([^\d]+)(.*)$/)
            if (match) time = match[2].trim()
        }

        return { time };
    }).filter(x => x.time);
}

const getPromotedTeams = (season, tableData, compInfo) => {
    const promoted = [];
    if (season.promovidosPlayoff && season.promovidosPlayoff.length > 0) {
        promoted.push(...season.promovidosPlayoff);
        const direct = (compInfo?.promovidos || 0) - season.promovidosPlayoff.length;
        if (direct > 0) promoted.push(...tableData.slice(0, direct).map(t => t.time).filter(n => !promoted.includes(n)));
    } else if (compInfo?.promovidos > 0) {
        promoted.push(...tableData.slice(0, compInfo.promovidos).map(t => t.time));
    }
    return promoted;
}

const calculateTotalTitles = (club) => {
    const nat = Object.values(club.stats.national).reduce((acc, v) => acc + v, 0);
    const int = (club.stats.libertadores || 0) + (club.stats.sudamericana || 0) + (club.stats.mundial || 0);
    return nat + int;
}

const sortedClubs = computed(() => {
    return [...countryClubs.value].sort((a, b) => {
        // Regra Padrão do Usuário (Sempre considerar Total de Títulos primeiro se solicitado)
        if (sortBy.value === 'total') {
            const totalDiff = calculateTotalTitles(b) - calculateTotalTitles(a);
            if (totalDiff !== 0) return totalDiff;
            
            // Critério 2: Títulos de Brasileirão Série A (como desempate de peso)
            const getSerieA = (obj) => {
                const key = Object.keys(obj.stats.national).find(k => normalizeName(k) === 'brasileirao serie a');
                return key ? obj.stats.national[key] : 0;
            };
            const serieADiff = getSerieA(b) - getSerieA(a);
            if (serieADiff !== 0) return serieADiff;
        } else {
            // Se o usuário selecionou uma coluna específica no SELECT
            const val = (obj, key) => {
                if (key.startsWith('nat_')) return obj.stats.national[key.replace('nat_', '')] || 0;
                return obj.stats[key] || 0;
            }
            const res = val(b, sortBy.value) - val(a, sortBy.value);
            if (res !== 0) return res;
        }
        
        // Critério de desempate alfabético
        return a.nome.localeCompare(b.nome);
    });
})

onMounted(() => {
    loadData();
})
</script>

<style scoped>
/* 1. CABEÇALHO TRANSMISSÃO */
:deep(thead) {
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.5)) !important;
  backdrop-filter: blur(10px);
}

:deep(thead th) {
  border: none !important;
  padding: 10px 4px !important;
  vertical-align: middle;
  font-size: 0.65rem;
  letter-spacing: 0.5px;
}

/* 2. LINHAS ESTILO "CARD" COM CORTE DIAGONAL */
.club-row {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Fundo padrão para células NÃO técnicas */
.club-row td:not(.col-total-titulos):not(.col-relegation):not(.col-access) {
  background: linear-gradient(90deg, rgba(0, 40, 80, 0.5) 0%, rgba(0, 20, 40, 0.3) 85%, rgba(0, 0, 0, 0) 100%) !important;
  border-top: 1px solid rgba(0, 150, 255, 0.08) !important;
  border-bottom: 1px solid rgba(0, 150, 255, 0.08) !important;
  padding-top: 8px !important;
  padding-bottom: 8px !important;
  position: relative;
}

.club-row td:first-child {
  border-left: 1px solid rgba(0, 150, 255, 0.1) !important;
  border-top-left-radius: 4px;
  border-bottom-left-radius: 4px;
}

/* Corte Diagonal na Extremidade Direita */
.club-row td:last-child {
  padding-right: 30px !important;
  clip-path: polygon(0 0, 100% 0, 93% 100%, 0 100%);
}

.club-row:nth-child(even) td:not(.col-total-titulos):not(.col-relegation):not(.col-access) {
  background: linear-gradient(90deg, rgba(0, 50, 100, 0.5) 0%, rgba(0, 25, 50, 0.3) 85%, rgba(0, 0, 0, 0) 100%) !important;
}

/* HOVER PREMIUM (Dominância Total do Brilho Ciano) */
.club-row:hover td,
.club-row:hover td:not(.col-total-titulos):not(.col-relegation):not(.col-access),
.club-row:hover .col-total-titulos,
.club-row:hover .col-relegation,
.club-row:hover .col-access {
  background: rgba(0, 242, 255, 0.12) !important;
  border-top: 1px solid rgba(0, 242, 255, 0.6) !important;
  border-bottom: 1px solid rgba(0, 242, 255, 0.6) !important;
  transition: all 0.2s ease !important;
}

/* Brilho Extra nas Bordas Laterais do Hover */
.club-row:hover td:first-child { border-left: 3px solid #00f2ff !important; box-shadow: inset 10px 0 15px -10px rgba(0, 242, 255, 0.6) !important; }
.club-row:hover td:last-child { border-right: 1px solid rgba(0, 242, 255, 0.4) !important; }

/* Glow no Nome ao Hover */
.club-row:hover .name-cell-full {
  color: #fff !important;
  text-shadow: 0 0 15px #00f2ff, 0 0 5px #00f2ff !important;
}

/* 3. PADRONIZAÇÃO DE NÚMEROS (ESTILO ELITE) */
.stat-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  border-radius: 4px;
  font-size: 0.95rem !important; /* Fonte Maior e Padronizada */
  font-weight: 950 !important; /* Negrito Ultra-Black */
  font-family: 'Inter', 'Outfit', sans-serif !important; /* Fonte Consistente */
  transition: all 0.2s ease;
}

/* 4. COLUNAS VERTICAIS COLORIDAS (ESTILO PILLAR BROADCAST) */
:deep(.col-total-titulos), :deep(.col-relegation), :deep(.col-access) {
  position: relative !important;
  z-index: 2 !important;
  padding: 0 !important;
  vertical-align: middle !important;
  border-top: 1px solid rgba(255, 255, 255, 0.03) !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03) !important;
}

/* Faixa Amarela (TOTAL) */
.col-total-titulos {
  background: linear-gradient(180deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 215, 0, 0.05) 100%) !important;
  border-left: 3px solid rgba(255, 234, 0, 0.5) !important;
  border-right: 1px solid rgba(255, 215, 0, 0.05) !important;
}

/* Faixa Vermelha (REBAIXAMENTO) */
.col-relegation {
  background: linear-gradient(180deg, rgba(255, 50, 50, 0.1) 0%, rgba(255, 50, 50, 0.03) 100%) !important;
  border-left: 2px solid rgba(255, 0, 60, 0.4) !important;
  border-right: 1px solid rgba(255, 0, 60, 0.05) !important;
}

/* Faixa Verde (ACESSO) */
.col-access {
  background: linear-gradient(180deg, rgba(50, 255, 50, 0.1) 0%, rgba(50, 255, 50, 0.03) 100%) !important;
  border-left: 2px solid rgba(57, 255, 20, 0.4) !important;
  border-right: 1px solid rgba(57, 255, 20, 0.05) !important;
}

/* Ajuste do Header (Integrado à Faixa) */
:deep(thead th).col-total-titulos { border-left-color: rgba(255, 234, 0, 0.3) !important; }
:deep(thead th).col-relegation { border-left-color: rgba(255, 0, 60, 0.3) !important; }
:deep(thead th).col-access { border-left-color: rgba(57, 255, 20, 0.3) !important; }

/* Removido o seletor duplicado de stat-badge */

.col-total-titulos .stat-badge, 
.col-relegation .stat-badge, 
.col-access .stat-badge {
  color: #fff !important;
  text-shadow: 0 0 5px rgba(0,0,0,0.5) !important;
}

/* Removido o conflito de hover segmentado anterior */

/* 5. NEONS E FONTES (SEM SOMBRA/CONTORNO) */
.text-neon-gold { color: #ffea00 !important; }
.text-info-neon { color: #00f2ff !important; }
.text-success-neon { color: #39ff14 !important; }
.text-danger-neon { color: #ff003c !important; }

.name-cell-full {
  white-space: nowrap;
  font-size: 0.75rem;
  letter-spacing: 0;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.75);
  transition: all 0.3s ease;
}

.fw-black { font-weight: 900; }
.ls-1 { letter-spacing: 1.5px; }

/* 6. ESTILOS DE PERSONALIZAÇÃO NACIONAL E COMPETIÇÃO */
.table-responsive {
  display: flex;
  justify-content: center;
  width: 100%;
  padding-left: 10px;
}

.table {
  width: auto !important;
  margin: 0 auto !important;
  min-width: 60%;
}

.row-competicoes-logos {
  background-color: #ffffff !important;
  background-image: none !important;
  backdrop-filter: none !important;
}

.row-competicoes-logos th {
  background-color: #ffffff !important;
  background-image: none !important;
  color: #333 !important;
  padding-top: 5px !important;
  padding-bottom: 5px !important;
}

.header-country-box {
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 20, 50, 0.6) 100%);
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.country-bg-flag {
  position: absolute;
  top: 0;
  right: 0;
  width: 70%; /* Estendido para cobrir mais área */
  height: 100%;
  background-size: cover;
  background-position: right center;
  filter: blur(1px) grayscale(0.2) brightness(0.6);
  opacity: 0.35; /* Acordou mais / Mais brilhante */
  mask-image: linear-gradient(to left, rgba(0,0,0,1) 60%, rgba(0,0,0,0));
  z-index: 1;
  pointer-events: none;
}

.header-title-main {
  text-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
  letter-spacing: 1px;
}

.logo-comp-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 65px; /* <--- AQUI: Aumente este valor para dar mais espaço vertical aos logos */
  transition: transform 0.3s ease;
}

.logo-comp-img {
  max-width: 100%;
  max-height: 65px; /* <--- AQUI: Mude este valor para aumentar/diminuir os logos principais */
  object-fit: contain;
  filter: drop-shadow(0 0 5px rgba(0, 0, 0, 0.2));
}

.logo-comp-img.mini {
  max-height: 38px; /* <--- AQUI: Mude este valor para os logos menores (Libertadores/Sula mini) */
  opacity: 0.8;
}

.hover-glow:hover {
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5) !important;
}

/* 7. ESCUDOS E SCROLLBAR */
:deep(img) {
  transition: transform 0.3s ease;
}
.club-row:hover :deep(img) {
  transform: scale(1.3);
  filter: drop-shadow(0 0 8px rgba(0, 242, 255, 0.4));
}

.custom-scrollbar::-webkit-scrollbar {
  height: 5px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0, 150, 255, 0.3);
  border-radius: 10px;
}
/* 7. PAINEL DE ESTATÍSTICAS (SIDEBAR) */
/* REMOVIDO: .stats-sidebar */
/* REMOVIDO: .stats-card */
/* REMOVIDO: .highlight-card */
/* REMOVIDO: .card-label */
/* REMOVIDO: .card-header-stats */
/* REMOVIDO: .club-name-big */
/* REMOVIDO: .ranking-item */
/* REMOVIDO: .rank-pos */
/* REMOVIDO: .rank-name */
/* REMOVIDO: .rank-value */
/* REMOVIDO: .stat-box */
/* REMOVIDO: .stat-box.access */
/* REMOVIDO: .stat-box.relegation */
/* REMOVIDO: .st-val */
/* REMOVIDO: .stat-box.access .st-val */
/* REMOVIDO: .stat-box.relegation .st-val */
/* REMOVIDO: .st-lbl */
/* REMOVIDO: .int-item */
/* REMOVIDO: .mini-logo */
/* REMOVIDO: .int-title */
/* REMOVIDO: .int-vals */

@keyframes fadeInRight {
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
}

@media (max-width: 1200px) {
  /* REMOVIDO: .stats-sidebar */
}
</style>
