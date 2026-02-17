<template>
  <div class="view-container">
    <h2 class="mb-4">BACKUP</h2>
    <div class="row g-4">
      <div class="col-md-6">
        <GamePanel>
          <div class="text-center p-4">
            <i class="bi bi-download fs-1 mb-3 text-secondary"></i>
            <h3>EXPORTAR BACKUP COMPLETO</h3>
            <p class="mb-4 opacity-75">Gere um arquivo JSON com todos os dados salvos e **todas as imagens de escudos e bandeiras**.</p>
            <GameButton @click="handleExport" class="w-100">Exportar Agora</GameButton>
          </div>
        </GamePanel>
      </div>
      <div class="col-md-6">
        <GamePanel>
          <div class="text-center p-4">
            <i class="bi bi-upload fs-1 mb-3 text-warning"></i>
            <h3>RESTAURAR SAVE FILE</h3>
            <p class="mb-4 opacity-75">Restaure seu progresso e **recupere todas as imagens** de um backup salvo.</p>
            <input type="file" ref="jsonInput" @change="handleImport" class="d-none" accept=".json">
            <GameButton @click="$refs.jsonInput.click()" class="w-100">Importar Arquivo</GameButton>
          </div>
        </GamePanel>
      </div>

      <!-- NOVA SEÇÃO: IMPORTAR BASE DO PES -->
      <div class="col-12 mt-4">
        <GamePanel>
          <div class="row align-items-center p-4">
            <div class="col-md-2 text-center">
              <i class="bi bi-file-earmark-excel fs-1 text-success"></i>
            </div>
            <div class="col-md-6">
              <h3>IMPORTAR BASE DO PES</h3>
              <p class="opacity-75 m-0">Converta sua planilha de clubes e seleções para o formato do sistema.</p>
              <small class="text-secondary opacity-50">Colunas: TIME, LINK ESCUDO, LINK BANDEIRA NACIONAL, CONTINENTE, PAÍS, LOGO CONTINENTE, FEDERAÇÃO</small>
            </div>
            <div class="col-md-4">
              <input type="file" ref="xlsxInput" @change="handlePESImport" class="d-none" accept=".xlsx, .xls">
              <GameButton @click="$refs.xlsxInput.click()" class="w-100">Selecionar Planilha Excel</GameButton>
            </div>
          </div>

          <!-- Preview/Log da Importação -->
          <div v-if="importLog" class="mt-3 p-3 bg-dark rounded border border-secondary border-opacity-25 small">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <span class="fw-bold text-secondary">LOG DE IMPORTAÇÃO:</span>
              <button class="btn btn-sm btn-outline-secondary py-0 border-0" @click="importLog = ''">Limpar</button>
            </div>
            <pre class="m-0 text-white-50" style="max-height: 150px; overflow-y: auto; font-family: monospace;">{{ importLog }}</pre>
            <div class="mt-3 d-flex gap-2">
              <GameButton v-if="clubsGenerated" @click="downloadFile('clubs.data.js', clubsGenerated)" class="btn-sm">Baixar clubs.data.js</GameButton>
              <GameButton v-if="nationalsGenerated" @click="downloadFile('nationalTeams.data.js', nationalsGenerated)" class="btn-sm">Baixar nationalTeams.data.js</GameButton>
            </div>
          </div>
        </GamePanel>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import GamePanel from '../components/GamePanel.vue'
import GameButton from '../components/GameButton.vue'
import LogoFREeFOOT from '../components/LogoFREeFOOT.vue'
import { db } from '../services/db'
import * as XLSX from 'xlsx'

const jsonInput = ref(null)
const xlsxInput = ref(null)
const importLog = ref('')
const clubsGenerated = ref('')
const nationalsGenerated = ref('')

const handlePESImport = (event) => {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target.result)
      const workbook = XLSX.read(data, { type: 'array' })
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      
      // Converte para array de arrays para procurar o cabeçalho manualmente
      const rowsRaw = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
      
      let headerIndex = -1
      let headers = []

      // Procura a linha que contém "TIME"
      for (let i = 0; i < rowsRaw.length; i++) {
        if (rowsRaw[i].includes('TIME')) {
          headerIndex = i
          headers = rowsRaw[i]
          break
        }
      }

      if (headerIndex === -1) {
        importLog.value += `❌ Erro: Coluna 'TIME' não encontrada em nenhuma linha.\n`
        return
      }

      importLog.value = `[${new Date().toLocaleTimeString()}] Lendo ${file.name}...\n`
      importLog.value += `Cabeçalho encontrado na linha ${headerIndex + 1}.\n`

      // Processa as linhas a partir do cabeçalho
      const clubs = []
      const nationals = []
      let processedCount = 0

      for (let i = headerIndex + 1; i < rowsRaw.length; i++) {
        const row = rowsRaw[i]
        const rowData = {}
        
        // Mapeia os valores da linha baseado nos nomes das colunas detectadas
        headers.forEach((h, idx) => {
          if (h) rowData[h] = row[idx]
        })

        if (!rowData['TIME'] || rowData['TIME'].toString().trim() === '') continue

        processedCount++

        const item = {
          id: processedCount,
          nome: rowData['TIME'] || '',
          pais: rowData['PAÍS'] || '',
          continente: rowData['CONTINENTE'] || '',
          escudo_url: rowData['LINK ESCUDO'] || '',
          bandeira_url: rowData['LINK BANDEIRA NACIONAL'] || '',
          logo_continente: rowData['LOGO CONTINENTE'] || '',
          federacao_logo: rowData['FEDERAÇÃO'] || rowData['LINK FEDERAÇÃO'] || rowData['FEDERACAO'] || ''
        }

        // Tentar identificar se é seleção
        if (item.nome.toUpperCase().includes('SELEÇÃO') || 
            item.continente.toUpperCase().includes('SELEÇÕES') ||
            !item.pais || item.federacao_logo) { /* Se tem federação logo, é forte indicio */
          nationals.push(item)
        } else {
          clubs.push(item)
        }
      }

      clubsGenerated.value = `export const CLUBS_DATA = ${JSON.stringify(clubs, null, 2)};`
      nationalsGenerated.value = `export const NATIONAL_TEAMS_DATA = ${JSON.stringify(nationals, null, 2)};`

      importLog.value += `Total processado: ${processedCount} linhas.\n`
      importLog.value += `✓ ${clubs.length} Clubes identificados.\n`
      importLog.value += `✓ ${nationals.length} Seleções identificadas.\n`
      importLog.value += `Clique nos botões abaixo para baixar os arquivos e salve-os na pasta /src/data do projeto.\n`

    } catch (err) {
      importLog.value += `❌ Erro ao processar: ${err.message}\n`
    }
  }
  reader.readAsArrayBuffer(file)
}

const downloadFile = (filename, content) => {
  const blob = new Blob([content], { type: 'text/javascript' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
  importLog.value += `✓ Arquivo ${filename} baixado.\n`
}

const handleExport = async () => {
  const json = await db.exportData()
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `FREeFOOT_Backup_${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
}

const handleImport = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  if (!confirm('Deseja realmente importar este backup? Os dados atuais serão substituídos.')) return

  const reader = new FileReader()
  reader.onload = async (e) => {
    try {
      const success = await db.importData(e.target.result)
      if (success) {
        alert('Backup importado com sucesso! Reiniciando...')
        window.location.reload()
      } else {
        alert('Erro ao importar. Verifique o arquivo.')
      }
    } catch (err) {
      alert('Erro ao processar arquivo JSON: ' + err.message)
    }
  }
  reader.readAsText(file)
}
</script>
