import { useCallback, useEffect, useReducer } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { productsApi } from '../api';
import { Product } from '../types';

type ProductSearchParams = {
  nombre: string;
  categoria: string | null;
  precioMin: number | null;
  precioMax: number | null;
  soloDisponibles: boolean;
};

type SearchState = {
  allProducts: Product[];
  currentPage: number;
};

type SearchAction =
  | { type: 'NEXT_PAGE' }
  | { type: 'RESET' }
  | { type: 'SET_PRODUCTS'; products: Product[]; replace: boolean };

function searchReducer(state: SearchState, action: SearchAction): SearchState {
  switch (action.type) {
    case 'NEXT_PAGE':
      return { ...state, currentPage: state.currentPage + 1 };
    case 'RESET':
      return { allProducts: [], currentPage: 0 };
    case 'SET_PRODUCTS':
      return {
        ...state,
        allProducts: action.replace ? action.products : [...state.allProducts, ...action.products],
      };
  }
}

export const useProductSearch = ({
  nombre, categoria, precioMin, precioMax, soloDisponibles,
}: ProductSearchParams) => {
  const [{ allProducts, currentPage }, dispatch] = useReducer(searchReducer, {
    allProducts: [],
    currentPage: 0,
  });

  const { data, isFetching, isError, refetch } = useQuery({
    queryKey: ['products', 'search', { nombre, categoria, precioMin, precioMax, soloDisponibles, currentPage }],
    queryFn: () => productsApi.search({
      ...(nombre.trim() !== '' ? { nombre: nombre.trim() } : {}),
      ...(categoria !== null ? { categoria } : {}),
      ...(precioMin !== null ? { precioMin } : {}),
      ...(precioMax !== null ? { precioMax } : {}),
      ...(soloDisponibles ? { disponible: true } : {}),
      page: currentPage,
      size: 20,
    }),
    staleTime: 0,
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (!data) return;
    dispatch({ type: 'SET_PRODUCTS', products: data.content, replace: data.currentPage === 0 });
  }, [data]);

  const loadNextPage = useCallback(() => {
    if (data && currentPage < data.totalPages - 1) {
      dispatch({ type: 'NEXT_PAGE' });
    }
  }, [currentPage, data]);

  const resetSearch = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  return {
    products: allProducts,
    isLoading: currentPage === 0 && isFetching,
    isFetchingMore: currentPage > 0 && isFetching,
    isError,
    totalElements: data?.totalElements ?? 0,
    hasNextPage: data ? currentPage < data.totalPages - 1 : false,
    loadNextPage,
    resetSearch,
    refetch,
  };
};
