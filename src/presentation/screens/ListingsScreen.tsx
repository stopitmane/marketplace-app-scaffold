import React, { useState } from 'react';
import { View, TextInput, FlatList } from 'react-native';
import { useListingsViewModel } from '../viewmodels/useListingsViewModel';
import { LoadingState, EmptyState, ErrorState, OfflineBanner } from '../components/States';
import { ListingCard } from '../components/ListingCard';
import { useTheme } from '../components/useTheme';
import type { ListingFilters } from '../../domain/models/Listing';

interface Props {
  onSelectListing: (id: string) => void;
}

export function ListingsScreen({ onSelectListing }: Props) {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  // In a real screen, debounce searchQuery before it reaches filters so
  // every keystroke doesn't trigger a network call.
  const filters: ListingFilters = { searchQuery: searchQuery || undefined };

  const { state, favouriteIds, toggleFavourite, retry, loadMore } = useListingsViewModel(filters);

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <TextInput
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search listings"
        placeholderTextColor={theme.textMuted}
        accessibilityLabel="Search listings"
        style={{ margin: 12, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: theme.border, color: theme.text }}
      />

      {state.status === 'success' && state.isStale && <OfflineBanner />}

      {state.status === 'loading' && <LoadingState />}
      {state.status === 'error' && <ErrorState error={state.error} onRetry={retry} />}
      {state.status === 'empty' && <EmptyState title="No listings found" subtitle="Try a different search or check back later." />}
      {state.status === 'success' && (
        <FlatList
          data={state.listings}
          numColumns={2}
          keyExtractor={(item) => item.id}
          onEndReached={state.hasMore ? loadMore : undefined}
          onEndReachedThreshold={0.4}
          renderItem={({ item }) => (
            <ListingCard
              listing={item}
              isFavourited={favouriteIds.has(item.id)}
              onPress={() => onSelectListing(item.id)}
              onToggleFavourite={() => toggleFavourite(item.id)}
            />
          )}
        />
      )}
    </View>
  );
}
