<template>
  <div class="view-container animated-fade-in" v-if="season">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div class="d-flex gap-2">
        <button @click="$router.push('/universo')" class="btn btn-outline-secondary">
          <i class="bi bi-arrow-left me-2"></i>VOLTAR
        </button>
        <button v-if="competitionInfo" 
                @click="$router.push(`/competicao/${competitionInfo.id}/historico`)" 
                class="btn btn-outline-info fw-bold">
          🏆 HISTÓRICO DO {{ competitionInfo.nome }}
        </button>
      </div>
      <LogoFREeFOOT />
    </div>

    <!-- CABEÇALHO RESUMO -->
    <div class="row g-2 mb-2">
      <div class="col-12">
        <GamePanel customClass="p-0 overflow-hidden">
          <div class="season-detail-header-compact p-2 text-center position-relative d-flex align-items-center justify-content-center">
            <div class="bg-blur-shield" :style="headerBgStyle"></div>
            <div class="position-relative z-1 d-flex align-items-center gap-4">
              <h2 class="fw-black text-uppercase m-0" style="font-size: 1.8rem; letter-spacing: 1px;">{{ season.ano }}</h2>
              <router-link v-if="competitionInfo" 
                           :to="`/competicao/${competitionInfo.id}/historico`" 
                           class="text-decoration-none">
                <div class="text-warning fw-black text-uppercase m-0 hvr-underline-gold" style="font-size: 1.1rem; letter-spacing: 2px;">
                  {{ season.competitionName }}
                </div>
              </router-link>
              <div v-else class="text-warning fw-black text-uppercase m-0" style="font-size: 1.1rem; letter-spacing: 2px;">{{ season.competitionName }}</div>
            </div>
          </div>

          <div class="row g-0 border-top border-secondary border-opacity-10">
            <!-- CAMPEÃO -->
            <div class="col-md-6 border-end border-secondary border-opacity-10 p-2 text-center bg-transparent">
              <div class="mb-1 small text-warning lh-1">
                {{ '⭐'.repeat(seasonCountTitles) }}
              </div>

              <!-- BLOCO CAMPEÃO PADRONIZADO -->
              <div class="bloco-campeao position-relative d-flex align-items-center justify-content-center mt-1">
                <!-- Partículas de Confete -->
                <div v-for="n in 10" :key="n" class="confetti-p"></div>

                <img v-if="competitionInfo && competitionInfo.trofeu" 
                     :src="getTrofeuPath(competitionInfo.trofeu)" 
                     class="trofeu-campeao" 
                     alt="Troféu"
                     @error="e => e.target.style.display='none'">
                
                <div class="position-relative d-flex align-items-center">
                  <TeamShield :teamName="season.campeao" :size="100" borderless class="escudo-campeao" :season="season.ano" />
                </div>

                <div class="text-start info-campeao">
                  <h5 class="fw-black text-uppercase mb-0 lh-1 d-flex align-items-center gap-2" style="font-size: 1.4rem;">
                    {{ season.campeao }}
                    <i v-if="careerStore.isUserTeam(season.campeao, season.ano)" class="bi bi-controller text-neon-green pulse-neon" style="font-size: 1.1rem;"></i>
                  </h5>
                  <div class="text-secondary small fw-bold text-uppercase opacity-75 mt-1" style="font-size: 0.8rem;">CAMPEÃO — {{ season.ano }}</div>
                </div>
              </div>

              <div v-if="isInternational && getClubInfo(season.campeao)" class="d-flex justify-content-center align-items-center gap-2 opacity-75 mt-2">
                <template v-if="competitionInfo?.modoRegistro === 'mundial'">
                   <img :src="getClubInfo(season.campeao).federacaoLogo" style="height: 14px; width: auto; object-fit: contain;" />
                   <span class="fw-bold x-small">{{ getClubInfo(season.campeao).federacao }}</span>
                   <span class="opacity-25 mx-1">|</span>
                </template>
                <NationalFlag :countryName="getClubInfo(season.campeao).pais" :forceUrl="getClubInfo(season.campeao).bandeira" :size="14" />
                <span class="fw-bold x-small">{{ getClubInfo(season.campeao).pais }}</span>
              </div>
            </div>

            <!-- VICE -->
            <div class="col-md-6 p-2 text-center bg-transparent shadow-inset-left">
              <div class="mb-1 d-inline-block pt-1">
                <TeamShield :teamName="season.vice" :size="80" borderless :season="season.ano" />
              </div>
              <h6 class="fw-bold text-uppercase text-secondary mb-0 small d-flex align-items-center justify-content-center gap-2">
                {{ season.vice || 'SEM VICE' }}
                <i v-if="season.vice && careerStore.isUserTeam(season.vice, season.ano)" class="bi bi-controller text-neon-green pulse-neon" style="font-size: 1.1rem;"></i>
              </h6>
              <div v-if="isInternational && season.vice && getClubInfo(season.vice)" class="d-flex justify-content-center align-items-center gap-2 opacity-50">
                <template v-if="competitionInfo?.modoRegistro === 'mundial'">
                   <img :src="getClubInfo(season.vice).federacaoLogo" style="height: 12px; width: auto; object-fit: contain;" />
                   <span class="fw-bold x-small">{{ getClubInfo(season.vice).federacao }}</span>
                   <span class="opacity-25 mx-1">|</span>
                </template>
                <NationalFlag :countryName="getClubInfo(season.vice).pais" :forceUrl="getClubInfo(season.vice).bandeira" :size="12" />
                <span class="fw-bold x-small">{{ getClubInfo(season.vice).pais }}</span>
              </div>
              <div class="mt-1 small opacity-50 lh-1">
                {{ '🥈'.repeat(seasonCountVices) }}
              </div>
            </div>
          </div>
        </GamePanel>
      </div>
    </div>


    <!-- CHAVEAMENTO MUNDIAL DE CLUBES -->
    <div v-if="competitionInfo?.modoRegistro === 'mundial'" class="row g-2 mb-4">
      <div class="col-12">
        <GamePanel customClass="p-0 overflow-hidden">
          <div class="px-3 py-2 bg-primary bg-opacity-20 d-flex justify-content-between align-items-center border-bottom border-primary border-opacity-20">
            <h6 class="m-0 text-primary fw-black x-small text-uppercase ls-1"><i class="bi bi-diagram-3-fill me-2"></i>MUNDIAL DE CLUBES - CHAVEAMENTO</h6>
            <button class="btn btn-sm btn-primary fw-black x-small" @click="saveMundial">SALVAR CHAVEAMENTO</button>
          </div>

          <div class="p-4 mundial-bracket-container">
            <div class="row g-4 justify-content-center align-items-center">
              <!-- SEMIFINAIS -->
              <div class="col-md-5">
                <div class="d-flex flex-column gap-4">
                  <!-- SEMI 1 -->
                  <div class="mundial-match-card">
                    <div class="match-title x-small fw-black text-secondary mb-2 text-center">SEMIFINAL 1</div>
                    <div class="d-flex align-items-center justify-content-between gap-2">
                      <div class="d-flex flex-column align-items-center text-center" style="width: 120px;">
                        <TeamShield :teamName="season.mundial.semi1.time1" :size="36" :season="season.ano" />
                        <input type="text" v-model="season.mundial.semi1.time1" class="form-control game-input-sm x-small text-center mt-1" placeholder="Time A">
                        <div v-if="getClubInfo(season.mundial.semi1.time1)" class="d-flex flex-column align-items-center gap-0 opacity-50 mt-1 lh-1">
                           <div class="d-flex align-items-center gap-1 mb-1">
                               <img :src="getClubInfo(season.mundial.semi1.time1).federacaoLogo" style="height: 8px; width: auto;" />
                               <span class="x-small fw-bold" style="font-size: 0.55rem;">{{ getClubInfo(season.mundial.semi1.time1).federacao }}</span>
                           </div>
                           <div class="d-flex align-items-center gap-1">
                               <NationalFlag :countryName="getClubInfo(season.mundial.semi1.time1).pais" :size="8" />
                               <span class="x-small fw-bold" style="font-size: 0.55rem;">{{ getClubInfo(season.mundial.semi1.time1).pais }}</span>
                           </div>
                        </div>
                      </div>
                      <div class="d-flex align-items-center gap-1">
                        <input type="number" v-model="season.mundial.semi1.placar1" class="form-control game-score-input fs-5">
                        <span class="opacity-25 x-small fw-bold">X</span>
                        <input type="number" v-model="season.mundial.semi1.placar2" class="form-control game-score-input fs-5">
                      </div>
                      <div class="d-flex flex-column align-items-center text-center" style="width: 120px;">
                        <TeamShield :teamName="season.mundial.semi1.time2" :size="36" :season="season.ano" />
                        <input type="text" v-model="season.mundial.semi1.time2" class="form-control game-input-sm x-small text-center mt-1" placeholder="Time B">
                        <div v-if="getClubInfo(season.mundial.semi1.time2)" class="d-flex flex-column align-items-center gap-0 opacity-50 mt-1 lh-1">
                           <div class="d-flex align-items-center gap-1 mb-1">
                               <img :src="getClubInfo(season.mundial.semi1.time2).federacaoLogo" style="height: 8px; width: auto;" />
                               <span class="x-small fw-bold" style="font-size: 0.55rem;">{{ getClubInfo(season.mundial.semi1.time2).federacao }}</span>
                           </div>
                           <div class="d-flex align-items-center gap-1">
                               <NationalFlag :countryName="getClubInfo(season.mundial.semi1.time2).pais" :size="8" />
                               <span class="x-small fw-bold" style="font-size: 0.55rem;">{{ getClubInfo(season.mundial.semi1.time2).pais }}</span>
                           </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <!-- SEMI 2 -->
                  <div class="mundial-match-card">
                    <div class="match-title x-small fw-black text-secondary mb-2 text-center">SEMIFINAL 2</div>
                    <div class="d-flex align-items-center justify-content-between gap-2">
                      <div class="d-flex flex-column align-items-center text-center" style="width: 120px;">
                        <TeamShield :teamName="season.mundial.semi2.time1" :size="36" :season="season.ano" />
                        <input type="text" v-model="season.mundial.semi2.time1" class="form-control game-input-sm x-small text-center mt-1" placeholder="Time A">
                        <div v-if="getClubInfo(season.mundial.semi2.time1)" class="d-flex flex-column align-items-center gap-0 opacity-50 mt-1 lh-1">
                           <div class="d-flex align-items-center gap-1 mb-1">
                               <img :src="getClubInfo(season.mundial.semi2.time1).federacaoLogo" style="height: 8px; width: auto;" />
                               <span class="x-small fw-bold" style="font-size: 0.55rem;">{{ getClubInfo(season.mundial.semi2.time1).federacao }}</span>
                           </div>
                           <div class="d-flex align-items-center gap-1">
                               <NationalFlag :countryName="getClubInfo(season.mundial.semi2.time1).pais" :size="8" />
                               <span class="x-small fw-bold" style="font-size: 0.55rem;">{{ getClubInfo(season.mundial.semi2.time1).pais }}</span>
                           </div>
                        </div>
                      </div>
                      <div class="d-flex align-items-center gap-1">
                        <input type="number" v-model="season.mundial.semi2.placar1" class="form-control game-score-input fs-5">
                        <span class="opacity-25 x-small fw-bold">X</span>
                        <input type="number" v-model="season.mundial.semi2.placar2" class="form-control game-score-input fs-5">
                      </div>
                      <div class="d-flex flex-column align-items-center text-center" style="width: 120px;">
                        <TeamShield :teamName="season.mundial.semi2.time2" :size="36" :season="season.ano" />
                        <input type="text" v-model="season.mundial.semi2.time2" class="form-control game-input-sm x-small text-center mt-1" placeholder="Time B">
                        <div v-if="getClubInfo(season.mundial.semi2.time2)" class="d-flex flex-column align-items-center gap-0 opacity-50 mt-1 lh-1">
                           <div class="d-flex align-items-center gap-1 mb-1">
                               <img :src="getClubInfo(season.mundial.semi2.time2).federacaoLogo" style="height: 8px; width: auto;" />
                               <span class="x-small fw-bold" style="font-size: 0.55rem;">{{ getClubInfo(season.mundial.semi2.time2).federacao }}</span>
                           </div>
                           <div class="d-flex align-items-center gap-1">
                               <NationalFlag :countryName="getClubInfo(season.mundial.semi2.time2).pais" :size="8" />
                               <span class="x-small fw-bold" style="font-size: 0.55rem;">{{ getClubInfo(season.mundial.semi2.time2).pais }}</span>
                           </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- FINAL & 3º LUGAR -->
              <div class="col-md-7">
                 <div class="d-flex flex-column gap-5 h-100 justify-content-center border-start border-secondary border-opacity-10 ps-5">
                    <!-- GRANDE FINAL -->
                    <div class="mundial-match-card final-card highlight-gold p-4">
                      <div class="match-title small fw-black text-warning mb-3 text-center ls-2">🏆 GRANDE FINAL</div>
                      <div class="d-flex align-items-center justify-content-between gap-4">
                        <div class="d-flex flex-column align-items-center flex-grow-1">
                          <TeamShield :teamName="season.mundial.final.time1" :size="80" borderless :season="season.ano" />
                          <div class="fw-black text-uppercase mt-2 text-center" style="font-size: 1.1rem;">{{ season.mundial.final.time1 || 'FINALISTA 1' }}</div>
                          <div v-if="getClubInfo(season.mundial.final.time1)" class="d-flex flex-column justify-content-center align-items-center gap-1 opacity-50 mt-1">
                             <div class="d-flex align-items-center gap-2">
                                <img :src="getClubInfo(season.mundial.final.time1).federacaoLogo" style="height: 12px; width: auto;" />
                                <span class="x-small fw-bold">{{ getClubInfo(season.mundial.final.time1).federacao }}</span>
                             </div>
                             <div class="d-flex align-items-center gap-2">
                                <NationalFlag :countryName="getClubInfo(season.mundial.final.time1).pais" :size="10" />
                                <span class="x-small fw-bold">{{ getClubInfo(season.mundial.final.time1).pais }}</span>
                             </div>
                          </div>
                        </div>
                        
                        <div class="d-flex align-items-center gap-2">
                          <input type="number" v-model="season.mundial.final.placar1" class="form-control game-score-input-lg">
                          <span class="fw-black opacity-25">X</span>
                          <input type="number" v-model="season.mundial.final.placar2" class="form-control game-score-input-lg">
                        </div>

                        <div class="d-flex flex-column align-items-center flex-grow-1">
                          <TeamShield :teamName="season.mundial.final.time2" :size="80" borderless :season="season.ano" />
                          <div class="fw-black text-uppercase mt-2 text-center" style="font-size: 1.1rem;">{{ season.mundial.final.time2 || 'FINALISTA 2' }}</div>
                          <div v-if="getClubInfo(season.mundial.final.time2)" class="d-flex flex-column justify-content-center align-items-center gap-1 opacity-50 mt-1">
                             <div class="d-flex align-items-center gap-2">
                                <img :src="getClubInfo(season.mundial.final.time2).federacaoLogo" style="height: 12px; width: auto;" />
                                <span class="x-small fw-bold">{{ getClubInfo(season.mundial.final.time2).federacao }}</span>
                             </div>
                             <div class="d-flex align-items-center gap-2">
                                <NationalFlag :countryName="getClubInfo(season.mundial.final.time2).pais" :size="10" />
                                <span class="x-small fw-bold">{{ getClubInfo(season.mundial.final.time2).pais }}</span>
                             </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- DISPUTA 3º LUGAR -->
                    <div class="mundial-match-card third-place-card py-2 px-4 shadow-sm bg-black bg-opacity-20 mx-auto" style="width: 400px;">
                      <div class="match-title x-small fw-black text-secondary mb-2 text-center opacity-50">DISPUTA 3º LUGAR</div>
                      <div class="d-flex align-items-center justify-content-between gap-2">
                        <div class="d-flex align-items-center gap-2 flex-grow-1">
                          <TeamShield :teamName="season.mundial.terceiro.time1" :size="20" borderless :season="season.ano" />
                          <span class="x-small fw-bold opacity-75 text-truncate" style="max-width: 100px;">{{ season.mundial.terceiro.time1 }}</span>
                        </div>
                        <div class="d-flex align-items-center gap-1">
                          <input type="number" v-model="season.mundial.terceiro.placar1" class="form-control game-score-input x-small">
                          <span class="opacity-25 x-small">x</span>
                          <input type="number" v-model="season.mundial.terceiro.placar2" class="form-control game-score-input x-small">
                        </div>
                        <div class="d-flex align-items-center gap-2 justify-content-end flex-grow-1">
                          <span class="x-small fw-bold opacity-75 text-truncate" style="max-width: 100px;">{{ season.mundial.terceiro.time2 }}</span>
                          <TeamShield :teamName="season.mundial.terceiro.time2" :size="20" borderless :season="season.ano" />
                        </div>
                      </div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </GamePanel>
      </div>
    </div>

    <!-- CONTEÚDO PRINCIPAL: TABELA + ARTILHARIA (SIDE-BY-SIDE SEM VÁCUO) -->
    <div class="d-flex flex-wrap gap-2 align-items-start">
      
      <!-- LADO ESQUERDO: TABELA (FIXED WIDTH TO ACTUAL SIZE) -->
      <div v-if="(competitionInfo?.modoRegistro === 'liga' && season.tabela) || competitionInfo?.modoRegistro === 'participantes'" class="flex-shrink-0" style="width: fit-content; max-width: 600px;">
        
        <!-- Caso Liga -->
        <GamePanel v-if="competitionInfo?.modoRegistro === 'liga'" customClass="p-0 overflow-hidden">
          <div class="px-3 py-2 bg-black bg-opacity-30 d-flex justify-content-between align-items-center border-bottom border-secondary border-opacity-10">
             <h6 class="m-0 text-info fw-black x-small text-uppercase ls-1"><i class="bi bi-list-ol me-2"></i>Classificação Final</h6>
             <span class="badge bg-info text-dark" style="font-size: 0.6rem;">{{ parsedTable.length }} TIMES</span>
          </div>
          <LeagueTable 
            :data="parsedTable" 
            :promotedCount="competitionStats.promoted"
            :relegationCount="competitionStats.relegated"
            :playoffPromotedTeams="season.promovidosPlayoff || []"
            :season="season.ano"
          />
        </GamePanel>

        <!-- Caso Participantes (Copa) -->
        <GamePanel v-if="competitionInfo?.modoRegistro === 'participantes'" customClass="p-0 overflow-hidden">
          <div class="px-3 py-2 bg-success bg-opacity-10 d-flex justify-content-between align-items-center border-bottom border-success border-opacity-20">
            <h6 class="m-0 text-success fw-black x-small text-uppercase ls-1"><i class="bi bi-people-fill me-2"></i>Classificação Final (Copa)</h6>
            <button class="btn btn-sm btn-success fw-black x-small" @click="saveClassification">SALVAR CLASSIFICAÇÃO</button>
          </div>
          
          <div class="px-2 pb-3">
            <div class="cup-table-v2 custom-scrollbar">
              <!-- CABEÇALHO -->
              <div class="cup-header-v2">
                <div class="h-main">
                  <div class="h-team">EQUIPE</div>
                </div>
                <div class="h-stats">
                  <div class="h-slant country">PAÍS</div>
                  <div class="h-slant pos">POSIÇÃO</div>
                </div>
              </div>

              <!-- LINHAS -->
              <div v-for="(p, idx) in season.participantes" :key="p.clubeId" 
                   class="cup-row-v2"
                   :class="[
                     { 'row-alt': idx % 2 !== 0 },
                     getPlacementColorClass(p.colocacao)
                   ]">
                

                <!-- INFO EQUIPE -->
                <div class="team-info-cup">
                  <!-- Ícone de Troféu/Medalha (condicional) -->
                  <div class="trophy-icon-container">
                    <span v-if="p.colocacao === 'CAMPEÃO'" class="trophy-icon gold">🏆</span>
                    <span v-else-if="p.colocacao === 'VICE'" class="trophy-icon silver">🥈</span>
                  </div>
                  <TeamShield :teamName="p.nome" :size="24" :season="season.ano" />
                  <span class="team-name text-truncate">{{ p.nome }}</span>
                </div>

                <!-- STATS / DADOS -->
                <div class="stats-group-cup">
                  <div class="stat-slant-cup country" :class="getFedColorClass(p.federacao)">
                    <!-- NOVO: BANDEIRA DO PAÍS COM BLUR (IGUAL AOS CARDS) -->
                    <img v-if="p.pais && getFlagUrl(p.pais)" 
                         :src="getCachedLogo(getFlagUrl(p.pais))" 
                         class="country-slant-bg-flag">
                    
                    <div class="country-bg-glass"></div>
                    
                    <div class="d-flex align-items-center justify-content-center w-100 slant-content gap-2" style="padding-right: 5px;">
                      <NationalFlag v-if="p.pais" :countryName="p.pais" :size="20" class="position-relative z-3" />
                      <span class="text-uppercase fw-black text-truncate" style="font-size: 0.7rem; letter-spacing: 0.5px;">{{ p.pais || '-' }}</span>
                    </div>
                  </div>

                  <div class="stat-slant-cup select-col" :class="getPlacementColorClass(p.colocacao)">
                    <div class="slant-content">
                      <select v-model="p.colocacao" 
                              class="form-select cup-input-select fw-black"
                              :class="getPlacementColorClass(p.colocacao)">
                         <option :value="null" class="bg-dark text-white">SELECIONAR</option>
                         <option v-for="opt in PLACEMENTS_OPTIONS" 
                                 :key="opt" 
                                 :value="opt"
                                 :class="getPlacementColorClass(opt) + '-option'">
                           {{ opt }}
                         </option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="!season.participantes || season.participantes.length === 0" class="text-center py-5 opacity-25 fw-black ls-1">
                NENHUM PARTICIPANTE CADASTRADO.
              </div>
            </div>
          </div>
        </GamePanel>
      </div>

      <!-- LADO DIREITO: ARTILHARIA PREMIUM (FILLS REMAINING SPACE) -->
      <div v-if="hasScorers" class="flex-grow-1" style="min-width: 400px;">
        <GamePanel customClass="h-100 p-0 overflow-hidden">
          <div class="p-2 px-3 bg-black bg-opacity-30 border-bottom border-secondary border-opacity-10">
            <h6 class="m-0 text-warning fw-black x-small text-uppercase ls-1">
              <i class="bi bi-person-badge me-2"></i>ARTILHEIRO — {{ season.ano }}
            </h6>
          </div>
          
          <div class="scorers-horizontal-container">
            <div v-for="(sc, idx) in allScorers" :key="idx" class="premium-scorer-card-h">
              
              <!-- DECORATION -->
              <div class="scorer-h-glow"></div>
              
              <div class="d-flex align-items-center w-100 h-100 position-relative z-2">
                <!-- TROFÉU DESTAQUE (ESPAÇO DEDICADO) -->
                <div class="scorer-trophy-box-h">
                  <img src="/logos/competitions/artilheiro.png" alt="Troféu">
                </div>

                <!-- FOTO -->
                <div class="scorer-photo-h" @click="openPhotoZoom(sc.fotoUrl)" :class="{ 'cursor-pointer': sc.fotoUrl }">
                  <img v-if="sc.fotoUrl" :src="getCachedLogo(sc.fotoUrl)" class="player-img">
                  <div v-else class="sc-placeholder-h"><i class="bi bi-person"></i></div>
                </div>

                <!-- INFO (NOME E POSIÇÃO) -->
                <div class="scorer-info-h">
                  <div class="d-flex flex-column">
                    <h3 class="scorer-name-h">{{ sc.nome }}</h3>
                    <div class="scorer-pos-h">{{ sc.posicaoCampo || 'CA' }}</div>
                  </div>
                </div>

                <!-- NACIONALIDADE -->
                <div class="scorer-nat-h">
                   <div class="v-divider-h"></div>
                   <div class="d-flex align-items-center gap-2 px-3">
                     <NationalFlag :countryName="sc.nacionalidade" :size="32" class="rounded-circle shadow" />
                     <span class="text-uppercase fw-black opacity-50" style="font-size: 0.8rem; letter-spacing: 1px;">{{ sc.nacionalidade }}</span>
                   </div>
                </div>

                <!-- CLUBE -->
                <div class="scorer-club-h">
                  <div class="v-divider-h"></div>
                  <div class="d-flex align-items-center gap-2 px-3">
                    <div class="club-shield-h-wrap">
                      <TeamShield :teamName="sc.clube" :size="48" borderless :season="season.ano" />
                    </div>
                    <div class="d-flex flex-column">
                      <span class="club-name-h">{{ sc.clube }}</span>
                      <div class="d-flex align-items-center gap-1 opacity-50" style="font-size: 0.65rem;">
                        <NationalFlag :countryName="getClubInfo(sc.clube)?.pais" :size="10" />
                        <span class="fw-bold">{{ getClubInfo(sc.clube)?.pais }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- GOLS (DESTAQUE AMARELO) -->
                <div class="scorer-goals-h ms-auto">
                  <div class="goals-box-h">
                    <div class="val">{{ sc.gols }}</div>
                    <div class="lbl">GOLS</div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </GamePanel>
      </div>

    </div>



    <!-- PHOTO ZOOM MODAL -->
    <div v-if="showPhotoZoom" class="photo-zoom-overlay" @click.self="showPhotoZoom = false">
      <div class="zoom-content-container">
        <button class="btn-close-zoom" @click="showPhotoZoom = false">
          <i class="bi bi-x-lg"></i>
        </button>
        <img :src="getCachedLogo(zoomedPhotoUrl)" class="zoomed-image-full">
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { seasonStore } from '../services/season.store'
import { careerStore } from '../services/career.store'
import { seasonService } from '../services/season.service'
import { CLUBS_DATA } from '../data/clubs.data'
import { FEDERATIONS_DATA } from '../services/federations.data'
import { getSeasonFinalYear, getTrofeuPath } from '../services/utils'
import GamePanel from '../components/GamePanel.vue'
import TeamShield from '../components/TeamShield.vue'
import NationalFlag from '../components/NationalFlag.vue'
import LogoFREeFOOT from '../components/LogoFREeFOOT.vue'
import LeagueTable from '../components/LeagueTable.vue'
import { dataSearchService } from '../services/dataSearch.service'
import { imageCacheService } from '../services/imageCache.service'
import { ALL_COMPETITIONS_DATA } from '../services/competitions.data'
import { INTERNATIONAL_DATA } from '../data/internationalCompetitions'

const PLACEMENTS_OPTIONS = [
  'CAMPEÃO',
  'VICE',
  'TERCEIRO',
  'SEMIFINAL',
  'QUARTAS',
  'OITAVAS',
  'FASE DE GRUPOS',
  'PRÉ-LIBERTADORES'
]

const route = useRoute()
const season = ref(null)
const cachedLogos = ref({})
const showPhotoZoom = ref(false)
const zoomedPhotoUrl = ref('')

const openPhotoZoom = (url) => {
  if (!url) return
  zoomedPhotoUrl.value = url
  showPhotoZoom.value = true
}

const getCachedLogo = (url) => {
  if (!url) return null
  if (url.startsWith('data:')) return url
  return cachedLogos.value[url] || url
}

const getFlagUrl = (countryName) => {
  if (!countryName) return null
  const data = dataSearchService.findNationalTeam(countryName) || dataSearchService.findClub(countryName)
  return data?.bandeira_url || null
}

const isInternational = computed(() => {
  return competitionInfo.value?.tipo === 'internacional' || 
         INTERNATIONAL_DATA.some(c => c.nome === season.value?.competitionName);
})

const competitionInfo = computed(() => {
  if (!season.value?.competitionName) return null
  
  const allComps = [
    ...ALL_COMPETITIONS_DATA.flatMap(continent => [
      ...continent.paises.flatMap(p => p.competicoes),
      ...continent.continentais
    ]),
    ...INTERNATIONAL_DATA
  ]
  
  let found = allComps.find(c => c.nome.toLowerCase().trim() === season.value.competitionName.toLowerCase().trim())
  
  // Fallback para nomes antigos/alternativos (CRÍTICO PARA EXIBIR TABELA)
  if (!found) {
    const sName = season.value.competitionName;
    if (sName === 'Liga Argentina Série B') {
       found = allComps.find(c => c.nome === 'Primera Nacional') || { nome: 'Liga Argentina Série B', modoRegistro: 'liga', tipo: 'Liga', rebaixados: 0, promovidos: 2 }
    } else if (sName === 'Liga Argentina') {
       found = allComps.find(c => c.nome === 'Liga Profissional') || { nome: 'Liga Argentina', modoRegistro: 'liga', tipo: 'Liga', rebaixados: 2, promovidos: 0 }
    } else {
       // Fallback genérico para garantir que a tabela apareça se tiver dados
       if (season.value.tabela) {
          found = { nome: sName, modoRegistro: 'liga', tipo: 'Liga', rebaixados: 0, promovidos: 0 }
       }
    }
  }

  return found
})

const competitionStats = computed(() => {
  const comp = competitionInfo.value
  
  return {
    promoted: comp?.promovidos || 0,
    relegated: getRelegationCount(comp)
  }
})

const getRelegationCount = (comp) => {
  if (!comp) return 0
  const name = comp.nome;
  if (name === 'Liga Profissional' || name === 'Primera División' || name === 'Liga Argentina') return 4 // Regra Argentina A
  return comp.rebaixados || 0
}


const getFederation = (continentName) => {
  if (!continentName) return { nome: 'Federação', logo: '' };
  const normalize = (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
  const normalizedKey = normalize(continentName);
  const key = Object.keys(FEDERATIONS_DATA).find(k => normalize(k) === normalizedKey);
  return FEDERATIONS_DATA[key] || { nome: 'Federação', logo: '' };
}

const getClubInfo = (clubName) => {
  if (!clubName) return null;
  const club = CLUBS_DATA.find(c => c.nome?.toLowerCase().trim() === clubName.toLowerCase().trim());
  if (!club) return null;
  const fed = getFederation(club.continente);
  return {
    pais: club.pais,
    bandeira: club.bandeira_url,
    federacao: fed.nome,
    federacaoLogo: fed.logo
  };
}

const hasScorers = computed(() => {
  return season.value && (
    (season.value.topScorers && season.value.topScorers.length > 0) || 
    (season.value.artilheiro && season.value.artilheiro.nome)
  );
})

const allScorers = computed(() => {
  if (!season.value) return [];
  if (season.value.topScorers) return season.value.topScorers;
  if (season.value.artilheiro && season.value.artilheiro.nome) return [season.value.artilheiro];
  return [];
})

const seasonCountTitles = computed(() => {
  if (!season.value) return 0
  const teamName = season.value.campeao
  const currentYear = getSeasonFinalYear(season.value.ano)
  
  return seasonStore.list.filter(s => {
    return s.campeao.toLowerCase().trim() === teamName.toLowerCase().trim() &&
           getSeasonFinalYear(s.ano) <= currentYear
  }).length
})

const seasonCountVices = computed(() => {
  if (!season.value || !season.value.vice) return 0
  const teamName = season.value.vice
  const currentYear = getSeasonFinalYear(season.value.ano)
  
  return seasonStore.list.filter(s => {
    return s.vice && s.vice.toLowerCase().trim() === teamName.toLowerCase().trim() &&
           getSeasonFinalYear(s.ano) <= currentYear
  }).length
})

const headerBgStyle = computed(() => {
  return {};
})

const parsedTable = computed(() => {
  if (!season.value?.tabela) return []
  const lines = season.value.tabela.split('\n').filter(l => l.trim())
  return lines.map(line => {
    let cells = line.split('\t')
    if (cells.length === 1) cells = line.split(/\s{2,}/)
    if (cells.length === 1) {
      const match = line.match(/^([^\d]+)(.*)$/)
      if (match) {
        const teamName = match[1].trim()
        const stats = match[2].trim().split(/\s+/)
        cells = [teamName, ...stats]
      }
    }
    return cells.map(c => c.trim()).filter(c => c)
  })
})

const loadSeasonData = async () => {
  const id = String(route.params.id);
  let found = seasonStore.list.find(s => String(s.id) === id);
  if (!found) {
    const allSeasons = await seasonService.getAll();
    found = allSeasons.find(s => String(s.id) === id);
  }
  if (found) {
    season.value = found;
    if (!season.value.participantes) season.value.participantes = [];
    if (!season.value.mundial && season.value.competitionName === 'Mundial de Clubes') {
      season.value.mundial = {
        semi1: { time1: '', time2: '', placar1: 0, placar2: 0 },
        semi2: { time1: '', time2: '', placar1: 0, placar2: 0 },
        final: { time1: '', time2: '', placar1: 0, placar2: 0 },
        terceiro: { time1: '', time2: '', placar1: 0, placar2: 0 }
      }
    }
    
    if (hasScorers.value) {
      for (const sc of allScorers.value) {
        if (sc.fotoUrl && !sc.fotoUrl.startsWith('http') && !sc.fotoUrl.startsWith('data:')) {
          const b64 = await imageCacheService.getLogo(sc.fotoUrl)
          if (b64) cachedLogos.value[sc.fotoUrl] = b64
        }
      }
    }
  }
}

const getPlacementColorClass = (colocacao) => {
  if (!colocacao) return '';
  const c = colocacao.toUpperCase().trim();
  if (c.includes('CAMPEÃO')) return 'pos-gold';
  if (c.includes('VICE')) return 'pos-silver';
  if (c.includes('TERCEIRO') || c.includes('SEMIFINAL')) return 'pos-bronze';
  if (c.includes('QUARTAS')) return 'pos-green';
  if (c.includes('OITAVAS')) return 'pos-cyan';
  if (c.includes('GRUPOS')) return 'pos-blue-dark';
  if (c.includes('PRÉ')) return 'pos-red';
  return '';
}

const getFedColorClass = (fedName) => {
  if (!fedName) return '';
  const n = fedName.toUpperCase();
  if (n.includes('CONMEBOL')) return 'fed-conmebol';
  if (n.includes('UEFA')) return 'fed-uefa';
  if (n.includes('CONCACAF')) return 'fed-concacaf';
  if (n.includes('FIFA')) return 'fed-fifa';
  if (n.includes('AFC') || n.includes('ASIA') || n.includes('ÁSIA')) return 'fed-afc';
  if (n.includes('CAF') || n.includes('AFRICA') || n.includes('ÁFRICA')) return 'fed-caf';
  return '';
}

onMounted(async () => {
  await seasonStore.loadAll()
  await careerStore.loadAll()
  loadSeasonData()
  
  // Força re-render dos selects após carregamento para aplicar CSS corretamente
  setTimeout(() => {
    if (season.value?.participantes) {
      season.value.participantes = [...season.value.participantes]
    }
  }, 100)
})

// Watcher para forçar re-aplicação de classes CSS quando dados mudam
watch(() => season.value?.participantes, (newVal) => {
  if (newVal && newVal.length > 0) {
    // Força re-render para aplicar classes CSS corretamente
    setTimeout(() => {
      const selects = document.querySelectorAll('.cup-input-select')
      selects.forEach(select => {
        // Força o navegador a re-renderizar o select
        select.style.display = 'none'
        select.offsetHeight // trigger reflow
        select.style.display = ''
      })
    }, 50)
  }
}, { deep: true, immediate: true })

watch(() => route.params.id, () => {
  loadSeasonData();
})

// FIX: Reagir a atualizações no Store (ex: após edição do artilheiro)
watch(() => seasonStore.list, () => {
  const id = String(route.params.id);
  const found = seasonStore.list.find(s => String(s.id) === id);
  if (found) {
     loadSeasonData();
  }
}, { deep: true })

const saveClassification = async () => {
  if (!season.value) return;

  // Atualizar automaticamente Campeão e Vice se houver na classificação
  const champ = season.value.participantes.find(p => p.colocacao === 'CAMPEÃO');
  const vice = season.value.participantes.find(p => p.colocacao === 'VICE');
  
  if (champ) season.value.campeao = champ.nome;
  if (vice) season.value.vice = vice.nome;

  try {
    // Gerar string da tabela para compatibilidade com históricos
    let tableStr = '';
    season.value.participantes.forEach((p, index) => {
       tableStr += `${index + 1}\t${p.nome}\t${p.colocacao || '-'}\n`;
    });

    await seasonStore.updateSeason(season.value.id, { 
      participantes: JSON.parse(JSON.stringify(season.value.participantes)),
      tabela: tableStr, // Salva a versão string para o parser do histórico
      campeao: season.value.campeao,
      vice: season.value.vice
    });
    alert('Classificação salva com sucesso!');
  } catch (error) {
    console.error('Erro ao salvar classificação:', error);
    alert('Erro ao salvar classificação.');
  }
}

const updateMundialPositions = () => {
  const m = season.value.mundial;
  if (!m) return;

  // Semi 1
  if (m.semi1.placar1 > m.semi1.placar2) {
    m.final.time1 = m.semi1.time1;
    m.terceiro.time1 = m.semi1.time2;
  } else if (m.semi1.placar2 > m.semi1.placar1) {
    m.final.time1 = m.semi1.time2;
    m.terceiro.time1 = m.semi1.time1;
  }

  // Semi 2
  if (m.semi2.placar1 > m.semi2.placar2) {
    m.final.time2 = m.semi2.time1;
    m.terceiro.time2 = m.semi2.time2;
  } else if (m.semi2.placar2 > m.semi2.placar1) {
    m.final.time2 = m.semi2.time2;
    m.terceiro.time2 = m.semi2.time1;
  }

  // Final
  if (m.final.placar1 > m.final.placar2) {
    season.value.campeao = m.final.time1;
    season.value.vice = m.final.time2;
  } else if (m.final.placar2 > m.final.placar1) {
    season.value.campeao = m.final.time2;
    season.value.vice = m.final.time1;
  }
}

const saveMundial = async () => {
  updateMundialPositions();
  try {
    await seasonStore.updateSeason(season.value.id, { 
      mundial: JSON.parse(JSON.stringify(season.value.mundial)),
      campeao: season.value.campeao,
      vice: season.value.vice
    });
    alert('Mundial salvo com sucesso!');
  } catch (error) {
    console.error('Erro ao salvar Mundial:', error);
  }
}
</script>

<style scoped>
.season-detail-header-compact {
  min-height: 50px;
  background: linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(20,20,20,0.6) 100%);
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.trophy-badge-mini {
  position: absolute;
  bottom: -4px;
  right: -4px;
  background: #000;
  color: #ffc107;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  border: 1px solid #ffc107;
  box-shadow: 0 0 10px rgba(255,193,7,0.4);
}

.bloco-campeao {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: default;
  transition: all 0.25s;
}

.bloco-campeao img {
  flex-shrink: 0;
}

.trofeu-campeao {
  height: 100px;
  width: auto;
  transition: 0.25s;
}

.escudo-campeao {
  height: 100px;
  width: auto;
}

.bloco-campeao:hover .trofeu-campeao {
  transform: scale(1.08);
  filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.6));
}

/* EFEITO CONFETE NO HOVER */
.confetti-p {
  position: absolute;
  width: 4px;
  height: 4px;
  background: #ffc107;
  border-radius: 50%;
  top: -10px;
  opacity: 0;
  pointer-events: none;
}

.bloco-campeao:hover .confetti-p {
  animation: confetti-fall 0.8s ease-out forwards;
}

@keyframes confetti-fall {
  0% { transform: translateY(0) scale(1); opacity: 1; }
  100% { transform: translateY(40px) scale(0); opacity: 0; }
}

.confetti-p:nth-child(1) { left: 20%; animation-delay: 0.0s; }
.confetti-p:nth-child(2) { left: 40%; animation-delay: 0.1s; }
.confetti-p:nth-child(3) { left: 60%; animation-delay: 0.05s; }
.confetti-p:nth-child(4) { left: 80%; animation-delay: 0.15s; }
.confetti-p:nth-child(5) { left: 30%; animation-delay: 0.2s; }
.confetti-p:nth-child(6) { left: 50%; animation-delay: 0.1s; }
.confetti-p:nth-child(7) { left: 70%; animation-delay: 0.25s; }
.confetti-p:nth-child(8) { left: 25%; animation-delay: 0.0s; }
.confetti-p:nth-child(9) { left: 55%; animation-delay: 0.3s; }
.confetti-p:nth-child(10) { left: 75%; animation-delay: 0.12s; }

/* NOVO LAYOUT ARTILHARIA HORIZONTAL PREMIUM */
.scorers-horizontal-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 15px;
}

.premium-scorer-card-h {
  height: 120px;
  background: rgba(10, 15, 25, 0.95);
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  overflow: hidden;
  position: relative;
  box-shadow: 0 10px 30px rgba(0,0,0,0.4);
}

.scorer-h-glow {
  position: absolute;
  top: 0; left: 0; bottom: 0; width: 300px;
  background: radial-gradient(circle at 0% 50%, rgba(255, 193, 7, 0.08) 0%, transparent 70%);
  pointer-events: none;
}

.scorer-trophy-box-h {
  width: 110px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.3);
  flex-shrink: 0;
  border-right: 1px solid rgba(255,255,255,0.08);
}

.scorer-trophy-box-h img {
  width: 80px;
  height: auto;
  filter: drop-shadow(0 0 20px rgba(255,193,7,0.6));
}

.scorer-photo-h {
  width: 140px;
  height: 100%;
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  background: rgba(0,0,0,0.4);
  flex-shrink: 0;
}

.player-img {
  height: 100%;
  width: auto;
  object-fit: contain;
  filter: drop-shadow(0 0 15px rgba(0,0,0,0.8));
}

.sc-placeholder-h {
  font-size: 4rem;
  opacity: 0.1;
  margin-bottom: 10px;
}

.scorer-info-h {
  padding: 0 25px;
  flex-grow: 1;
}

.scorer-name-h {
  font-weight: 900;
  font-size: 1.8rem;
  text-transform: uppercase;
  margin: 0;
  letter-spacing: -0.5px;
  color: #fff;
  text-shadow: 0 2px 10px rgba(0,0,0,0.5);
}

.scorer-pos-h {
  font-weight: 900;
  font-size: 0.8rem;
  color: #58ccff;
  letter-spacing: 2px;
  text-transform: uppercase;
}

.v-divider-h {
  width: 1px;
  height: 60px;
  background: rgba(255,255,255,0.08);
  flex-shrink: 0;
}

.scorer-nat-h, .scorer-club-h {
  display: flex;
  align-items: center;
  height: 100%;
}

.club-name-h {
  font-weight: 900;
  font-size: 1rem;
  text-transform: uppercase;
}

.club-shield-h-wrap {
  background: rgba(255,255,255,0.03);
  padding: 5px;
  border-radius: 10px;
}

.scorer-goals-h {
  padding-right: 20px;
}

.goals-box-h {
  background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%);
  color: #000;
  padding: 10px 20px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 0 25px rgba(255, 152, 0, 0.4);
  transform: scale(1.1);
}

.goals-box-h .val {
  font-size: 2.2rem;
  font-weight: 900;
  line-height: 1;
}

.goals-box-h .lbl {
  font-size: 0.6rem;
  font-weight: 900;
  letter-spacing: 1px;
}

/* UTILS */
.ls-1 { letter-spacing: 1px; }
.x-small { font-size: 0.7rem; }
.fw-black { font-weight: 900; }

@keyframes slideInRight {
  from { opacity: 0; transform: translateX(30px); }
  to { opacity: 1; transform: translateX(0); }
}

.premium-scorer-card-h {
  animation: slideInRight 0.5s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
}

.hvr-underline-gold {
  position: relative;
  display: inline-block;
  transition: all 0.3s ease;
}

.hvr-underline-gold::after {
  content: '';
  position: absolute;
  width: 0;
  height: 2px;
  bottom: -2px;
  left: 0;
  background-color: #ffc107;
  transition: width 0.3s ease;
  box-shadow: 0 0 8px rgba(255, 193, 7, 0.5);
}

.cursor-pointer {
  cursor: pointer;
}

/* Photo Zoom Modal */
.photo-zoom-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.95);
  backdrop-filter: blur(15px);
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.zoom-content-container {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 50px rgba(0,0,0,0.8);
  border: 2px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  overflow: hidden;
  background: #000;
}

.zoomed-image-full {
  max-width: 100%;
  max-height: 90vh;
  object-fit: contain;
}

.btn-close-zoom {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(255,255,255,0.1);
  border: none;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  z-index: 3010;
}

.btn-close-zoom:hover {
  background: #ff4136;
  transform: rotate(90deg);
}

.hvr-underline-gold:hover {
  filter: brightness(1.2);
  transform: translateY(-1px);
}

.hvr-underline-gold:hover::after {
  width: 100%;
}
/* Cup Table V2 - Modern Style */
.cup-table-v2 {
  display: flex;
  flex-direction: column;
  gap: 2px;
  width: 100%;
}

.cup-header-v2 {
  display: flex;
  align-items: flex-end;
  margin-bottom: 4px;
}

.h-main {
  display: flex;
  width: 210px;
  font-weight: 900;
  font-size: 0.6rem;
  color: rgba(255, 255, 255, 0.4);
  letter-spacing: 1px;
}

.h-pos { width: 40px; text-align: center; }
.h-team { padding-left: 15px; display: flex; align-items: center; justify-content: flex-start; }

.h-stats {
  display: flex;
  gap: 2px;
  flex-grow: 1;
}

.h-slant {
  background: rgba(255, 255, 255, 0.05);
  transform: skewX(-20deg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.55rem;
  font-weight: 900;
  color: rgba(255, 255, 255, 0.5);
  height: 16px;
  padding: 0 10px;
}

.h-slant.country { width: 160px; }
.h-slant.fed { width: 80px; }
.h-slant.pos { width: 140px; }

.cup-row-v2 {
  display: flex;
  align-items: stretch;
  background: rgba(15, 25, 40, 0.85);
  height: 32px;
  position: relative;
  transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.cup-row-v2:hover {
  transform: scale(1.015);
  z-index: 5;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

/* HOVER NEON DINÂMICO POR POSIÇÃO */
.cup-row-v2.pos-gold:hover {
  background: linear-gradient(90deg, rgba(255, 215, 0, 0.25), rgba(255, 215, 0, 0.1)) !important;
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.6), inset 0 0 15px rgba(255, 215, 0, 0.2);
  border-left: 4px solid #ffd700;
}

.cup-row-v2.pos-silver:hover {
  background: linear-gradient(90deg, rgba(192, 192, 192, 0.25), rgba(192, 192, 192, 0.1)) !important;
  box-shadow: 0 0 20px rgba(192, 192, 192, 0.6), inset 0 0 15px rgba(192, 192, 192, 0.2);
  border-left: 4px solid #c0c0c0;
}

.cup-row-v2.pos-bronze:hover {
  background: linear-gradient(90deg, rgba(255, 140, 0, 0.25), rgba(255, 140, 0, 0.1)) !important;
  box-shadow: 0 0 20px rgba(255, 140, 0, 0.6), inset 0 0 15px rgba(255, 140, 0, 0.2);
  border-left: 4px solid #ff8c00;
}

.cup-row-v2.pos-green:hover {
  background: linear-gradient(90deg, rgba(46, 204, 113, 0.25), rgba(46, 204, 113, 0.1)) !important;
  box-shadow: 0 0 20px rgba(46, 204, 113, 0.6), inset 0 0 15px rgba(46, 204, 113, 0.2);
  border-left: 4px solid #2ecc71;
}

.cup-row-v2.pos-cyan:hover {
  background: linear-gradient(90deg, rgba(0, 242, 255, 0.25), rgba(0, 242, 255, 0.1)) !important;
  box-shadow: 0 0 20px rgba(0, 242, 255, 0.6), inset 0 0 15px rgba(0, 242, 255, 0.2);
  border-left: 4px solid #00f2ff;
}

.cup-row-v2.pos-blue-dark:hover {
  background: linear-gradient(90deg, rgba(0, 86, 179, 0.25), rgba(0, 86, 179, 0.1)) !important;
  box-shadow: 0 0 20px rgba(0, 86, 179, 0.6), inset 0 0 15px rgba(0, 86, 179, 0.2);
  border-left: 4px solid #0056b3;
}

.cup-row-v2.pos-red:hover {
  background: linear-gradient(90deg, rgba(231, 76, 60, 0.25), rgba(231, 76, 60, 0.1)) !important;
  box-shadow: 0 0 20px rgba(231, 76, 60, 0.6), inset 0 0 15px rgba(231, 76, 60, 0.2);
  border-left: 4px solid #e74c3c;
}

.row-alt { background: rgba(10, 18, 30, 0.5); }


.team-info-cup {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  padding-left: 8px; /* Reduzido para dar espaço ao ícone */
  width: 210px;
  z-index: 1;
  background: rgba(30, 40, 55, 0.98); 
  border-right: 1px solid rgba(255, 255, 255, 0.1);
}

/* Container do ícone de troféu/medalha */
.trophy-icon-container {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.trophy-icon {
  font-size: 18px;
  animation: trophy-pulse 2s ease-in-out infinite;
}

.trophy-icon.gold {
  filter: drop-shadow(0 0 4px rgba(255, 215, 0, 0.8));
}

.trophy-icon.silver {
  filter: drop-shadow(0 0 4px rgba(192, 192, 192, 0.8));
}

@keyframes trophy-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.team-name {
  font-weight: 800;
  font-size: 0.75rem;
  text-transform: uppercase;
  color: #fff !important; /* Garantindo nome branco independente da posição */
  text-shadow: 2px 2px 4px rgba(0,0,0,0.9);
}

.stats-group-cup {
  display: flex;
  gap: 2px;
  width: fit-content; /* Remove excesso lateral */
}

.stat-slant-cup {
  background: rgba(0, 0, 0, 0.2);
  transform: skewX(-20deg);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.stat-slant-cup .slant-content {
  transform: skewX(20deg);
  display: flex;
  align-items: center;
  justify-content: center; /* Centralizado conforme solicitado */
  width: 100%;
  font-weight: 800;
  font-size: 0.65rem;
  z-index: 2;
  position: relative;
  text-shadow: 0 0 4px rgba(0,0,0,0.5);
}

.country-bg-glass {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  opacity: 0.4;
  background: linear-gradient(135deg, rgba(255,255,255,0.05), transparent);
}

.stat-slant-cup.country { 
  width: 160px;
  border-left: 2px solid rgba(255, 255, 255, 0.05);
  position: relative;
  overflow: hidden; /* Garante que o blur não vaze */
}

.country-slant-bg-flag {
  position: absolute;
  top: 0;
  left: -5%; /* Mais centralizada para visibilidade */
  transform: skewX(20deg) scale(1.5); 
  width: 80%; 
  height: 100%;
  object-fit: cover;
  opacity: 0.7; /* Bem visível agora */
  filter: brightness(0.9); /* Removi o blur para silhueta nítida */
  mask-image: linear-gradient(to right, black 75%, transparent 100%);
  -webkit-mask-image: linear-gradient(to right, black 75%, transparent 100%);
  z-index: 1;
  pointer-events: none;
}

.stat-slant-cup.fed { width: 80px; background: rgba(0, 0, 0, 0.3); }

/* FEDERATION COLORS WITH GRADIENTS */
.fed-conmebol { 
  border-left-color: #2ecc40 !important; 
  background: linear-gradient(90deg, rgba(46, 204, 64, 0.2), transparent) !important;
}
.fed-uefa { 
  border-left-color: #0074d9 !important; 
  background: linear-gradient(90deg, rgba(0, 116, 217, 0.2), transparent) !important;
}
.fed-concacaf { 
  border-left-color: #ff6400 !important; 
  background: linear-gradient(90deg, rgba(255, 100, 0, 0.2), transparent) !important;
}
.fed-fifa { 
  border-left-color: #ffdc00 !important; 
  background: linear-gradient(90deg, rgba(255, 220, 0, 0.2), transparent) !important;
}
.fed-afc { 
  border-left-color: #ff00ff !important; 
  background: linear-gradient(90deg, rgba(255, 0, 255, 0.15), transparent) !important;
}
.fed-caf { 
  border-left-color: #00ffff !important; 
  background: linear-gradient(90deg, rgba(0, 255, 255, 0.15), transparent) !important;
}

.stat-slant-cup.select-col { width: 140px; background: rgba(0, 0, 0, 0.4); }

/* SPECIAL ROW ACCENTS */
.linha-campeao {
  background: linear-gradient(90deg, rgba(255, 215, 0, 0.1), transparent) !important;
  border-left: 3px solid #ffc107;
}
.bg-champion-cup {
  background: linear-gradient(135deg, #ffc107 0%, #b8860b 100%) !important;
  color: #000 !important;
}

.linha-vice {
  background: linear-gradient(90deg, rgba(200, 200, 200, 0.1), transparent) !important;
  border-left: 3px solid #6c757d;
}
.bg-vice-cup {
  background: linear-gradient(135deg, #a0a0a0 0%, #444 100%) !important;
  color: #fff !important;
}

/* CUSTOM SELECT INSIDE SLANT */
.cup-input-select {
  background: transparent !important;
  border: none !important;
  color: #000 !important;
  font-size: 0.65rem;
  padding: 0 10px;
  height: 28px;
  width: 130px;
  cursor: pointer;
  appearance: none;
  text-align: center;
  font-weight: 900 !important;
}

/* Overlay de texto sobre o select */
.select-text-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.65rem;
  font-weight: 950;
  pointer-events: none;
  z-index: 1;
  text-transform: uppercase;
}

.select-text-overlay.pos-gold {
  color: #000 !important;
}

.select-text-overlay.pos-silver {
  color: #000 !important;
}

.cup-input-select:focus {
  outline: none;
  box-shadow: none;
}

.cup-input-select option {
  background: #111;
  color: white;
  font-weight: bold;
}

/* GARANTIR COR DO TEXTO EM TODAS AS SITUAÇÕES */
select.cup-input-select.pos-gold,
select.cup-input-select.pos-gold option:checked {
  color: #000 !important;
}

select.cup-input-select.pos-silver,
select.cup-input-select.pos-silver option:checked {
  color: #000 !important;
}

/* Mundial Bracket Styles */
.mundial-match-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 12px;
  position: relative;
}

.highlight-gold {
  border-color: rgba(255, 215, 0, 0.3);
  box-shadow: 0 0 15px rgba(255, 215, 0, 0.1);
}

.game-score-input {
  width: 40px;
  text-align: center;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #ffc107;
  font-weight: 900;
  padding: 4px;
}

.game-score-input-lg {
  width: 60px;
  text-align: center;
  background: rgba(0, 0, 0, 0.7);
  border: 1px solid rgba(255, 215, 0, 0.3);
  color: #ffc107;
  font-weight: 900;
  font-size: 1.25rem;
  padding: 8px;
}

.game-input-sm {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  padding: 4px 8px;
}

.final-card {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.05) 0%, rgba(0, 0, 0, 0.4) 100%);
}

.text-neon-green {
  color: #39ff14;
  text-shadow: 0 0 8px rgba(57, 255, 20, 0.8);
}

.pulse-neon {
  animation: pulse-neon-anim 2s infinite;
  display: inline-block;
}

@keyframes pulse-neon-anim {
  0% { opacity: 0.7; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
  100% { opacity: 0.7; transform: scale(1); }
}
/* FUNDO DAS LINHAS (SUAVE) */
.cup-row-v2.pos-gold { background: rgba(255, 215, 0, 0.15) !important; }
.cup-row-v2.pos-silver { background: rgba(192, 192, 192, 0.15) !important; }
.cup-row-v2.pos-bronze { background: rgba(255, 140, 0, 0.15) !important; }
.cup-row-v2.pos-green { background: rgba(46, 204, 113, 0.15) !important; }
.cup-row-v2.pos-cyan { background: rgba(0, 242, 255, 0.15) !important; }
.cup-row-v2.pos-blue-dark { background: rgba(0, 86, 179, 0.15) !important; }
.cup-row-v2.pos-red { background: rgba(231, 76, 60, 0.15) !important; }

/* BADGES DAS POSIÇÕES (VIBRANTES/SÓLIDAS) - COR DE FUNDO E TEXTO */
select.form-select.cup-input-select.pos-gold { 
  background-color: #ffd700 !important; 
  color: #000 !important; 
  font-weight: 800 !important; /* Reduzido de 950 */
  font-size: 0.9rem !important; /* Aumentado de 0.65rem */
  opacity: 1 !important; 
  -webkit-text-fill-color: #000000 !important;
  text-shadow: 0 0 1px #cfcccc !important;
  filter: contrast(2);
}

select.form-select.cup-input-select.pos-silver { 
  background-color: #c0c0c0 !important; 
  color: #000 !important; 
  font-weight: 800 !important; /* Reduzido de 950 */
  font-size: 0.9rem !important; /* Aumentado de 0.65rem */
  opacity: 1 !important;
  -webkit-text-fill-color: #000 !important;
  text-shadow: 0 0 1px cfcccc !important;
  filter: contrast(2);
}

select.form-select.cup-input-select.pos-bronze { 
  background-color: #ff8c00 !important; 
  color: #ffffff !important; 
  font-weight: 950 !important;
  -webkit-text-fill-color: #ffffff !important;
}

select.form-select.cup-input-select.pos-green { 
  background-color: #28a745 !important; 
  color: #ffffff !important; 
  font-weight: 950 !important;
  -webkit-text-fill-color: #ffffff !important;
}

select.form-select.cup-input-select.pos-cyan { 
  background-color: #0b8eca !important; 
  color: #fffafa !important; 
  font-weight: 950 !important;
  -webkit-text-fill-color: #fffafa !important;
}

select.form-select.cup-input-select.pos-blue-dark { 
  background-color: #0e00d8 !important; 
  color: #ffffff !important; 
  font-weight: 950 !important;
  -webkit-text-fill-color: #ffffff !important;
}

select.form-select.cup-input-select.pos-red { 
  background-color: #dc3545 !important; 
  color: #ffffff !important; 
  font-weight: 950 !important;
  -webkit-text-fill-color: #ffffff !important;
}
</style>
