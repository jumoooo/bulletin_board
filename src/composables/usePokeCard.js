import pokemon from 'pokemontcgsdk';

// 취미 페이지에서만 로드되므로 여기서 초기화 (부트 제거로 초기 번들 크기 감소)
const apiKey = import.meta.env.VITE_POKEMON_API_KEY;
if (apiKey) {
  pokemon.configure({ apiKey });
}

export const usePokeCard = () => {
  const getPokemonCards = async params => {
    if (params?.q.length > 0 && !/^[a-zA-Z0-9\s:]+$/.test(params?.q)) {
      throw new Error('카드 이름은 영어로 입력해 주세요.');
    }
    try {
      const query = params.q
        ? `${params.q} -supertype:Energy`
        : '-supertype:Energy';
      const response = await pokemon.card.where({
        q: query,
        pageSize: params.pageSize,
        page: params.page,
      });
      return response;
    } catch (err) {
      throw err;
    }
  };
  return {
    getPokemonCards,
  };
};
