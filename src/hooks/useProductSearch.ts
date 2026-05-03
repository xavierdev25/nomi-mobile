import { useCallback, useEffect, useState } from 'react';
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

export const useProductSearch = ({
  nombre,
  categoria,
  precioMin,
  precioMax,
  soloDisponibles,
}: ProductSearchParams) => {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(0);

  const { data, isFetching, isError, refetch } = useQuery({
    queryKey: [
      'products',
      'search',
      { nombre, categoria, precioMin, precioMax, soloDisponibles, currentPage },
    ],
    queryFn: () =>
      productsApi.search({
        ...(nombre.trim() !== '' ? { nombre: nombre.trim() } : {}),
        ...(categoria !== null ? { categoria } : {}),
        ...(precioMin !== null ? { precioMin } : {}),
        ...(precioMax !== null ? { precioMax } : {}),
        ...(soloDisponibles ? { disponible: true } : {}),
        page: currentPage,
        size: 20,
      }),
    staleTime: 1000 * 60 * 2,
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (!data) return;

    if (data.currentPage === 0) {
      setAllProducts(data.content);
    } else {
      setAllProducts((prev) => [...prev, ...data.content]);
    }
  }, [data]);

  const loadNextPage = useCallback(() => {
    if (data && currentPage < data.totalPages - 1) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [currentPage, data]);

  const resetSearch = useCallback(() => {
    setCurrentPage(0);
    setAllProducts([]);
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
