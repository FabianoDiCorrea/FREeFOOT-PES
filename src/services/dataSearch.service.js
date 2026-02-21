import { clubStore } from './club.store';
import { NATIONAL_TEAMS_DATA } from '../data/nationalTeams.data';
import { normalizeString } from './utils';

export const dataSearchService = {
    /**
     * Busca um clube pelo nome.
     */
    findClub(name) {
        if (!name) return null;
        const search = normalizeString(name);
        const list = clubStore.list.length > 0 ? clubStore.list : [];

        return list.find(c => normalizeString(c.nome) === search) ||
            list.find(c => normalizeString(c.nome).includes(search));
    },

    /**
     * Busca uma seleção pelo nome.
     */
    findNationalTeam(name) {
        if (!name) return null;
        const search = normalizeString(name);

        // Tenta busca pelo nome ou pelo país (se for seleção, o país pode estar vazio nos dados)
        return NATIONAL_TEAMS_DATA.find(n => normalizeString(n.nome) === search) ||
            NATIONAL_TEAMS_DATA.find(n => normalizeString(n.nome).includes(search)) ||
            NATIONAL_TEAMS_DATA.find(n => normalizeString(n.pais) === search);
    },

    /**
     * Retorna todos os clubes de um país.
     */
    getClubsByCountry(countryName) {
        if (!countryName) return [];
        const search = normalizeString(countryName);
        const list = clubStore.list.length > 0 ? clubStore.list : [];
        return list.filter(c => normalizeString(c.pais) === search);
    },

    /**
     * Retorna todas as seleções de um continente.
     */
    getNationalsByContinent(continentName) {
        if (!continentName) return [];
        const search = normalizeString(continentName);
        return NATIONAL_TEAMS_DATA.filter(n => normalizeString(n.continente) === search);
    },

    /**
     * Busca automática (Clube ou Seleção).
     */
    search(name) {
        return this.findClub(name) || this.findNationalTeam(name);
    }
};
