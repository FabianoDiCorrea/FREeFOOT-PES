import { reactive, computed } from 'vue';
import { careerService } from './career.service';
import { seasonStore } from './season.store';

export const careerStore = reactive({
    history: [],
    loading: false,

    async loadAll() {
        this.loading = true;
        try {
            this.history = await careerService.getAll();
        } catch (e) {
            console.error('Erro ao carregar histórico de carreira:', e);
        } finally {
            this.loading = false;
        }
    },

    async saveEntry(entry) {
        try {
            const saved = await careerService.save(entry);
            // Atualizar lista local
            const index = this.history.findIndex(h => h.id === saved.id);
            if (index !== -1) {
                this.history[index] = saved;
            } else {
                this.history.push(saved);
            }
            return saved;
        } catch (e) {
            console.error('Erro ao salvar entrada de carreira:', e);
            throw e;
        }
    },

    async removeEntry(id) {
        try {
            await careerService.remove(id);
            this.history = this.history.filter(h => h.id !== id);
        } catch (e) {
            console.error('Erro ao remover entrada de carreira:', e);
        }
    },

    /**
     * Verifica se um determinado time em uma determinada temporada foi comandado pelo usuário.
     * @param {string} teamName 
     * @param {string} seasonYear 
     */
    isUserTeam(teamName, seasonYear) {
        if (!teamName || !seasonYear) return false;
        const normalizedTeam = teamName.toLowerCase().trim();
        const normalizedYear = seasonYear.toString().toLowerCase().trim().replace(/\s/g, '');

        return this.history.some(h => {
            const hTeam = h.timeNome?.toLowerCase().trim();
            const hYear = h.temporada?.toString().toLowerCase().trim().replace(/\s/g, '');
            return hTeam === normalizedTeam && hYear === normalizedYear;
        });
    },

    /**
     * Tenta buscar estatísticas da liga automaticamente do seasonStore.
     */
    getAutoStats(teamName, seasonYear) {
        // Esta lógica será melhor implementada na view ou via helper, 
        // pois depende do carregamento das temporadas de uma competição específica.
        return null;
    }
});
