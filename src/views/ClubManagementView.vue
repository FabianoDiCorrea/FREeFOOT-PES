<template>
  <div class="view-container animated-fade-in">
    <!-- CABEÇALHO -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div class="d-flex gap-2">
        <button @click="handleBack" class="btn btn-outline-secondary">
          <i class="bi bi-arrow-left me-2"></i>VOLTAR
        </button>
      </div>
      <div class="text-center flex-grow-1">
        <h2 class="fw-black text-uppercase m-0 ls-2 text-warning">
          <i class="bi bi-shield-shaded me-2"></i>GESTÃO DE CLUBES
        </h2>
        <div class="small text-secondary fw-bold text-uppercase mt-1 opacity-75">Navegue por país ou use a busca global</div>
      </div>
      <LogoFREeFOOT />
    </div>

    <!-- BREADCRUMB DE NAVEGAÇÃO -->
    <div class="mb-4 d-flex gap-2 align-items-center flex-wrap px-2" v-if="!searchQuery">
      <button @click="resetNavigation" class="breadcrumb-btn" :class="{ active: !selectedContinent }">
        MUNDO
      </button>
      <i class="bi bi-chevron-right opacity-25" v-if="selectedContinent"></i>
      <button v-if="selectedContinent" @click="selectedCountry = null" class="breadcrumb-btn" :class="{ active: selectedContinent && !selectedCountry }">
        {{ selectedContinent.continente }}
      </button>
      <i class="bi bi-chevron-right opacity-25" v-if="selectedCountry"></i>
      <button v-if="selectedCountry" class="breadcrumb-btn active">
        {{ selectedCountry.nome }}
      </button>
    </div>

    <div class="row g-4">
      <!-- COLUNA ESQUERDA: NAVEGAÇÃO / LISTA -->
      <div class="col-lg-7">
        <GamePanel customClass="h-100 d-flex flex-column" style="min-height: 70vh;">
          <div class="p-3 border-bottom border-secondary border-opacity-10">
            <div class="input-group">
              <span class="input-group-text bg-black border-secondary border-opacity-25 text-secondary">
                <i class="bi bi-search"></i>
              </span>
              <input 
                type="text" 
                v-model="searchQuery" 
                class="form-control game-input" 
                placeholder="BUSCAR TIME NO MUNDO TODO..."
              />
              <button class="btn btn-warning fw-black" @click="createNewClub">
                <i class="bi bi-plus-lg me-1"></i> NOVO TIME
              </button>
              <button class="btn btn-outline-info fw-black" @click="exportClubsToCSV" title="Exportar para Excel (CSV)">
                <i class="bi bi-download"></i>
              </button>
              <button class="btn btn-outline-info fw-black" @click="$refs.fileInput.click()" title="Importar do Excel (CSV)">
                <i class="bi bi-upload"></i>
              </button>
              <input type="file" ref="fileInput" @change="handleCSVImport" accept=".csv" class="d-none">
            </div>
          </div>

          <div class="flex-grow-1 overflow-auto custom-scrollbar p-3">
            
            <!-- RESULTADOS DA BUSCA (OVERRIDE) -->
            <div v-if="searchQuery" class="club-list-grid">
              <div 
                v-for="club in searchResults" 
                :key="club.id" 
                class="club-item-card"
                :class="{ 'active': selectedClub?.id === club.id }"
                @click="selectClub(club)"
              >
                <div class="d-flex align-items-center gap-3">
                  <TeamShield :teamName="club.nome" :size="40" :forceUrl="club.escudo_url" />
                  <div class="min-w-0">
                    <div class="fw-black text-uppercase truncate text-white mb-0" style="font-size: 0.85rem;">{{ club.nome }}</div>
                    <div class="d-flex align-items-center gap-1 opacity-50">
                      <NationalFlag :countryName="club.pais" :forceUrl="club.bandeira_url" :size="12" />
                      <span class="x-small fw-bold text-uppercase">{{ club.pais }}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div v-if="searchResults.length === 0" class="text-center py-5 opacity-25 fw-black text-uppercase">
                 Nenhum time encontrado para "{{ searchQuery }}".
              </div>
            </div>

            <!-- NÍVEL 1: SELEÇÃO DE CONTINENTE -->
            <div v-else-if="!selectedContinent" class="continent-grid">
              <div v-for="cont in orderedContinents" :key="cont.continente" 
                   class="continent-card" @click="selectContinent(cont)">
                <img :src="cont.logo_continente" class="continent-logo mb-3">
                <h4 class="m-0 fw-black text-uppercase">{{ cont.continente }}</h4>
                <div class="small opacity-50 fw-bold">{{ cont.paises.length }} PAÍSES</div>
              </div>
            </div>

            <!-- NÍVEL 2: SELEÇÃO DE PAÍS -->
            <div v-else-if="!selectedCountry" class="country-grid">
               <div v-for="pais in selectedContinent.paises" :key="pais.nome" 
                    class="country-item-card" @click="selectCountry(pais)">
                 <div class="d-flex align-items-center gap-3">
                   <NationalFlag :countryName="pais.nome" :forceUrl="pais.bandeira" :size="40" />
                   <h5 class="m-0 fw-black text-uppercase">{{ pais.nome }}</h5>
                 </div>
               </div>
            </div>

            <!-- NÍVEL 3: LISTA DE TIMES DO PAÍS -->
            <div v-else class="club-list-grid">
              <div 
                v-for="club in countryClubs" 
                :key="club.id" 
                class="club-item-card"
                :class="{ 'active': selectedClub?.id === club.id }"
                @click="selectClub(club)"
              >
                <div class="d-flex align-items-center gap-3">
                  <TeamShield :teamName="club.nome" :size="44" :forceUrl="club.escudo_url" />
                  <div class="min-w-0">
                    <div class="fw-black text-uppercase truncate text-white mb-1">{{ club.nome }}</div>
                    <div class="d-flex align-items-center gap-2 opacity-50">
                      <span class="x-small fw-black text-uppercase">{{ club.continente }}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div v-if="countryClubs.length === 0" class="text-center py-5 opacity-25 fw-black text-uppercase">
                 Nenhum time registrado em {{ selectedCountry.nome }}.
              </div>
            </div>

          </div>
          
          <div class="p-3 border-top border-secondary border-opacity-10 bg-black bg-opacity-20">
            <div class="d-flex justify-content-between align-items-center small fw-bold text-secondary">
              <span v-if="searchQuery">BUSCA: {{ searchResults.length }} RESULTADOS</span>
              <span v-else-if="selectedCountry">TIMES EM {{ selectedCountry.nome.toUpperCase() }}: {{ countryClubs.length }}</span>
              <span v-else-if="selectedContinent">PAÍSES EM {{ selectedContinent.continente.toUpperCase() }}: {{ selectedContinent.paises.length }}</span>
              <span v-else>MUNDO: {{ ALL_COMPETITIONS_DATA.length }} CONTINENTES</span>
            </div>
          </div>
        </GamePanel>
      </div>

      <!-- COLUNA DIREITA: FORMULÁRIO DE EDIÇÃO (MANTIDO) -->
      <div class="col-lg-5">
        <!-- O formulário permanece igual, pois sua lógica de edição é sólida -->
        <GamePanel v-if="selectedClub" customClass="neon-warning h-100">
          <div class="d-flex justify-content-between align-items-start mb-4">
            <h4 class="fw-black text-uppercase m-0">
              <i class="bi bi-pencil-square me-2"></i>{{ isNew ? 'CRIAR NOVO' : 'EDITAR' }} TIME
            </h4>
            <button v-if="!isNew && isCustom(selectedClub.id)" @click="deleteClub" class="btn btn-outline-danger btn-sm">
              <i class="bi bi-trash"></i>
            </button>
          </div>

          <div class="scroll-form custom-scrollbar pe-2" style="max-height: 65vh; overflow-y: auto;">
            <div class="text-center mb-4 p-4 bg-black bg-opacity-40 rounded-4 border border-secondary border-opacity-10">
              <div class="mb-3 position-relative d-inline-block">
                <TeamShield :teamName="editForm.nome" :size="120" :forceUrl="editForm.escudo_url" />
              </div>
              <h3 class="fw-black text-uppercase mb-0">{{ editForm.nome || 'NOME DO TIME' }}</h3>
              <div class="d-flex justify-content-center align-items-center gap-3 mt-2">
                <div class="d-flex align-items-center gap-2 px-3 py-1 bg-white bg-opacity-5 rounded-pill border border-secondary border-opacity-10">
                  <NationalFlag :countryName="editForm.pais" :forceUrl="editForm.bandeira_url" :size="20" />
                  <span class="small fw-bold text-uppercase">{{ editForm.pais || 'PAÍS' }}</span>
                </div>
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label x-small fw-bold text-secondary text-uppercase">Nome do Clube</label>
              <input type="text" v-model="editForm.nome" class="form-control game-input" placeholder="Ex: Vasco da Gama">
            </div>

            <div class="mb-3">
              <label class="form-label x-small fw-bold text-secondary text-uppercase">URL do Escudo</label>
              <input type="text" v-model="editForm.escudo_url" class="form-control game-input" placeholder="https://...">
            </div>

            <div class="row g-3">
              <div class="col-md-6">
                <div class="mb-3">
                  <label class="form-label x-small fw-bold text-secondary text-uppercase">País</label>
                  <input type="text" v-model="editForm.pais" class="form-control game-input" placeholder="Ex: Brasil">
                </div>
              </div>
              <div class="col-md-6">
                <div class="mb-3">
                  <label class="form-label x-small fw-bold text-secondary text-uppercase">Continente</label>
                  <select v-model="editForm.continente" class="form-select game-input">
                    <option value="AMÉRICA DO SUL">AMÉRICA DO SUL</option>
                    <option value="EUROPA">EUROPA</option>
                    <option value="AMÉRICA DO NORTE">AMÉRICA DO NORTE</option>
                    <option value="ÁFRICA">ÁFRICA</option>
                    <option value="ÁSIA">ÁSIA</option>
                    <option value="OCEANIA">OCEANIA</option>
                    <option value="FIFA">FIFA / MUNDIAL</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label x-small fw-bold text-secondary text-uppercase">URL da Bandeira</label>
              <input type="text" v-model="editForm.bandeira_url" class="form-control game-input" placeholder="https://...">
            </div>

            <div class="mb-3">
              <label class="form-label x-small fw-bold text-secondary text-uppercase">ID PES (Opcional)</label>
              <input type="number" v-model="editForm.pesId" class="form-control game-input" placeholder="ID">
            </div>
          </div>

          <div class="d-grid gap-2 mt-4 pt-4 border-top border-secondary border-opacity-10">
            <button class="btn btn-warning btn-lg fw-black text-uppercase" @click="saveClub" :disabled="!editForm.nome || saving">
              <i class="bi bi-save2 me-2" v-if="!saving"></i>
              <span v-else class="spinner-border spinner-border-sm me-2"></span>
              {{ isNew ? 'CRIAR TIME' : 'SALVAR ALTERAÇÕES' }}
            </button>
            <button @click="selectedClub = null" class="btn btn-link text-secondary text-decoration-none fw-bold x-small">
              CANCELAR
            </button>
          </div>
        </GamePanel>

        <GamePanel v-else customClass="h-100 d-flex flex-column align-items-center justify-content-center text-center py-5">
           <i class="bi bi-shield-lock-fill display-1 mb-3 opacity-10"></i>
           <h4 class="text-secondary opacity-50 fw-black text-uppercase">Selecione um time para editar</h4>
           <div class="small text-secondary opacity-25 px-4 mt-2">Escolha um país e então o time, ou use a busca global para encontrar qualquer clube instantaneamente.</div>
        </GamePanel>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { clubStore } from '../services/club.store'
import GamePanel from '../components/GamePanel.vue'
import TeamShield from '../components/TeamShield.vue'
import NationalFlag from '../components/NationalFlag.vue'
import LogoFREeFOOT from '../components/LogoFREeFOOT.vue'
import { ALL_COMPETITIONS_DATA } from '../services/competitions.data'

const searchQuery = ref('')
const selectedContinent = ref(null)
const selectedCountry = ref(null)
const selectedClub = ref(null)
const isNew = ref(false)
const saving = ref(false)

const editForm = ref({
  id: null,
  nome: '',
  pais: '',
  continente: 'AMÉRICA DO SUL',
  escudo_url: '',
  bandeira_url: '',
  federacao_logo: '',
  pesId: null
})

onMounted(async () => {
  await clubStore.init()
})

// Ordenação solicitada: América do Sul, América do Norte, Europa...
const orderedContinents = computed(() => {
  const order = ["América do Sul", "América do Norte", "Europa", "África", "Ásia", "Oceania"]
  return [...ALL_COMPETITIONS_DATA].sort((a, b) => {
    const idxA = order.indexOf(a.continente)
    const idxB = order.indexOf(b.continente)
    return (idxA > -1 ? idxA : 99) - (idxB > -1 ? idxB : 99)
  })
})

const searchResults = computed(() => {
  if (!searchQuery.value) return []
  const q = searchQuery.value.toLowerCase().trim()
  return clubStore.list.filter(c => 
    c.nome.toLowerCase().includes(q) || 
    c.pais?.toLowerCase().includes(q)
  ).slice(0, 50)
})

const countryClubs = computed(() => {
  if (!selectedCountry.value) return []
  const pais = selectedCountry.value.nome.toLowerCase().trim()
  return clubStore.list.filter(c => c.pais?.toLowerCase().trim() === pais)
})

const selectContinent = (cont) => {
  selectedContinent.value = cont
  selectedCountry.value = null
}

const selectCountry = (pais) => {
  selectedCountry.value = pais
}

const selectClub = (club) => {
  isNew.value = false
  selectedClub.value = club
  editForm.value = JSON.parse(JSON.stringify(club))
}

const resetNavigation = () => {
  selectedContinent.value = null
  selectedCountry.value = null
  searchQuery.value = ''
}

const createNewClub = () => {
  isNew.value = true
  selectedClub.value = { id: 'new' }
  editForm.value = {
    id: null, nome: '', pais: selectedCountry.value?.nome || '', 
    continente: selectedContinent.value?.continente || 'AMÉRICA DO SUL',
    escudo_url: '', bandeira_url: selectedCountry.value?.bandeira || '',
    federacao_logo: '', pesId: null
  }
}

const isCustom = (id) => clubStore.customClubs.some(c => c.id === id)

const saveClub = async () => {
  if (!editForm.value.nome) return
  saving.value = true
  try {
    await clubStore.saveClub(editForm.value)
    selectedClub.value = null
    alert('Time salvo com sucesso!')
  } catch (error) {
    alert('Erro ao salvar o time.')
  } finally {
    saving.value = false
  }
}

const deleteClub = async () => {
  if (!selectedClub.value?.id) return
  if (confirm(`Deseja remover as customizações do time ${selectedClub.value.nome}?`)) {
    try {
      await clubStore.removeClub(selectedClub.value.id)
      selectedClub.value = null
    } catch (error) {}
  }
}

const handleBack = () => {
  if (selectedCountry.value) selectedCountry.value = null
  else if (selectedContinent.value) selectedContinent.value = null
  else $router.push('/universo')
}

// --- CSV LOGIC (EXCEL INTEGRATION) ---

const exportClubsToCSV = () => {
  // Cabeçalhos (Apenas os campos editáveis relevantes)
  const headers = ['id', 'nome', 'pais', 'continente', 'escudo_url', 'bandeira_url', 'pesId']
  
  // Usar apenas os clubes customizados ou todos? 
  const rows = clubStore.list.map(c => [
    c.id || '',
    c.nome || '',
    c.pais || '',
    c.continente || '',
    c.escudo_url || '',
    c.bandeira_url || '',
    c.pesId || ''
  ])

  // BOM UTF-8 (\ufeff) é essencial para o Excel reconhecer acentos em UTF-8
  // Usamos ponto e vírgula (;) pois é o padrão de separador do Excel no Brasil (PT-BR)
  const csvContent = "\ufeff" + headers.join(";") + "\n"
    + rows.map(e => e.map(val => {
        // Escapar aspas duplas e envolver em aspas para segurança
        const cleanVal = val.toString().replace(/"/g, '""')
        return `"${cleanVal}"`
    }).join(";")).join("\n")

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement("a")
  link.setAttribute("href", url)
  link.setAttribute("download", "lista_de_clubes.csv")
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

const fileInput = ref(null)

const handleCSVImport = (event) => {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = async (e) => {
    const text = e.target.result
    const lines = text.split(/\r?\n/).filter(line => line.trim())
    if (lines.length < 2) return

    // Detectar separador (vírgula ou ponto e vírgula)
    const firstLine = lines[0]
    const separator = firstLine.includes(';') ? ';' : ','
    
    const headers = firstLine.split(separator).map(h => h.trim().replace(/"/g, ''))
    
    let importedCount = 0
    let updatedCount = 0

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue
      
      // Regex para lidar com separadores dentro de aspas
      const regex = new RegExp(`("${separator}"|[^"${separator}\\s]+|"(?:\\""|[^"])*")`, 'g')
      const values = []
      let match
      while ((match = regex.exec(line)) !== null) {
          values.push(match[0].trim().replace(/^"|"$/g, '').replace(/""/g, '"'))
      }

      const clubData = {}
      headers.forEach((header, idx) => {
        clubData[header] = values[idx] || ''
      })

      if (clubData.nome && clubData.pais) {
        await clubStore.saveClub({
          ...clubData,
          id: clubData.id || null,
          pesId: clubData.pesId ? parseInt(clubData.pesId) : null
        })
        if (clubData.id) updatedCount++
        else importedCount++
      }
    }
    
    alert(`Sincronização concluída!\n${importedCount} novos times criados.\n${updatedCount} times atualizados.`)
    event.target.value = '' // Reset input
    await clubStore.init() // Recarregar
  }
  reader.readAsText(file)
}

// Injetar o router para o handleBack funcionar
import { useRouter } from 'vue-router'
const router = useRouter()
const $router = { push: (p) => router.push(p) }
</script>

<style scoped>
/* Grid de Continentes */
.continent-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1rem;
}

.continent-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 1.5rem;
  padding: 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.continent-card:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-5px);
  border-color: var(--bs-warning);
  box-shadow: 0 10px 20px rgba(0,0,0,0.3);
}

.continent-logo {
  height: 60px;
  width: auto;
  object-fit: contain;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.5));
}

/* Grid de Países */
.country-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 0.75rem;
}

.country-item-card {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 1rem;
  border-radius: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.country-item-card:hover {
  background: rgba(255, 255, 255, 0.05);
  transform: scale(1.02);
  border-color: var(--bs-info);
}

/* Grid de Clubes */
.club-list-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 0.75rem;
}

.club-item-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 0.75rem 1rem;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.club-item-card:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateX(5px);
  border-color: var(--bs-warning);
}

.club-item-card.active {
  background: rgba(255, 193, 7, 0.1);
  border-color: var(--bs-warning);
}

/* Breadcrumb Estilo Universo */
.breadcrumb-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 150, 255, 0.2);
  color: #a0aec0;
  padding: 6px 16px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  transition: all 0.2s;
}

.breadcrumb-btn.active {
  background: var(--bs-warning);
  color: #000;
  border-color: #fff;
}

.truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ls-2 { letter-spacing: 2px; }

.game-input {
  background: rgba(0, 0, 0, 0.4) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  color: white !important;
  border-radius: 8px;
}

.neon-warning {
  border-color: rgba(255, 193, 7, 0.3) !important;
  box-shadow: 0 0 20px rgba(255, 193, 7, 0.1) !important;
}
</style>
