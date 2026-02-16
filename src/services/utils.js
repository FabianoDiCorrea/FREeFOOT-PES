/**
 * Remove acentos e converte para minúsculas para buscas mais precisas.
 */
export const normalizeString = (str) => {
    if (!str) return '';
    return str
        .toString()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
};

/**
 * Extrai o ano final de uma string de temporada (ex: "2027/2028" -> 2028).
 */
export const getSeasonFinalYear = (seasonStr) => {
    if (!seasonStr) return 0;
    const parts = seasonStr.split('/');
    const year = parts.length > 1 ? parts[1] : parts[0];
    return parseInt(year) || 0;
};

/**
 * Retorna o caminho da imagem do troféu baseado no slug.
 */
export const getTrofeuPath = (slug) => {
    if (!slug) return '';
    return `/assets/trofeus/${slug}.png`;
};
