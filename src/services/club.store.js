import { reactive } from 'vue'
import { CLUBS_DATA } from '../data/clubs.data'
import { db } from './db'

export const clubStore = reactive({
    list: [],
    customClubs: [], // Clubes salvos no IDB
    loading: false,

    /**
     * Inicializa o store carregando dados do IndexedDB e mesclando com CLUBS_DATA.
     */
    async init() {
        this.loading = true;
        try {
            this.customClubs = await db.getAll('custom_clubs') || [];
            this.refreshList();
        } catch (error) {
            console.error('Erro ao inicializar clubStore:', error);
        } finally {
            this.loading = false;
        }
    },

    /**
     * Atualiza a lista principal mesclando dados estáticos com customizados.
     */
    refreshList() {
        // Começamos com os dados estáticos do arquivo
        const base = JSON.parse(JSON.stringify(CLUBS_DATA));

        // Aplicamos as customizações (overrides por ID ou nome)
        this.customClubs.forEach(custom => {
            const idx = base.findIndex(c => c.id === custom.id || (custom.nome && c.nome === custom.nome));
            if (idx !== -1) {
                base[idx] = { ...base[idx], ...custom };
            } else {
                // Se o ID não existe, é um novo clube
                base.push(custom);
            }
        });

        this.list = base;
    },

    /**
     * Salva ou atualiza um clube.
     */
    async saveClub(clubData) {
        if (!clubData.nome) throw new Error('Nome do clube é obrigatório');

        const clubToSave = {
            ...clubData,
            id: clubData.id || Date.now() // Gera um ID se for novo
        };

        // Atualiza estado local
        const idx = this.customClubs.findIndex(c => c.id === clubToSave.id);
        if (idx !== -1) {
            this.customClubs[idx] = clubToSave;
        } else {
            this.customClubs.push(clubToSave);
        }

        // Salva a lista completa no IndexedDB
        await db.save('custom_clubs', this.customClubs);

        this.refreshList();
        return clubToSave;
    },

    /**
     * Remove um clube (apenas se for customizado).
     */
    async removeClub(clubId) {
        this.customClubs = this.customClubs.filter(c => c.id !== clubId);
        await db.save('custom_clubs', this.customClubs);
        this.refreshList();
    },

    /**
     * Busca info de um clube de forma unificada.
     */
    getClub(clubName) {
        if (!clubName) return null;
        const q = clubName.toLowerCase().trim();
        return this.list.find(c => c.nome.toLowerCase().trim() === q) || null;
    }
});
