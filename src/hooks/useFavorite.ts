import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { favoritesApi } from '../api';

export const useProductFavorite = (productId: number) => {
    const queryClient = useQueryClient();

    const { data: isFavorite = false, isLoading } = useQuery({
        queryKey: ['favorite', 'product', productId],
        queryFn: () => favoritesApi.checkProduct(productId),
    });

    const { mutate: toggle, isPending } = useMutation({
        mutationFn: () =>
            isFavorite
                ? favoritesApi.removeProduct(productId)
                : favoritesApi.addProduct(productId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['favorite', 'product', productId] });
            queryClient.invalidateQueries({ queryKey: ['favorites', 'products'] });
        },
    });

    return { isFavorite, isLoading, toggle, isPending };
};

export const useStoreFavorite = (storeId: number) => {
    const queryClient = useQueryClient();

    const { data: isFavorite = false, isLoading } = useQuery({
        queryKey: ['favorite', 'store', storeId],
        queryFn: () => favoritesApi.checkStore(storeId),
    });

    const { mutate: toggle, isPending } = useMutation({
        mutationFn: () =>
            isFavorite
                ? favoritesApi.removeStore(storeId)
                : favoritesApi.addStore(storeId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['favorite', 'store', storeId] });
            queryClient.invalidateQueries({ queryKey: ['favorites', 'stores'] });
        },
    });

    return { isFavorite, isLoading, toggle, isPending };
};