import React from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import type { Listing } from '../../domain/models/Listing';
import { CachedImage } from './CachedImage';
import { useTheme } from './useTheme';

interface Props {
  listing: Listing;
  isFavourited: boolean;
  onPress: () => void;
  onToggleFavourite: () => void;
}

export function ListingCard({ listing, isFavourited, onPress, onToggleFavourite }: Props) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${listing.title}, ${(listing.priceCents / 100).toFixed(2)} ${listing.currency}`}
      style={[styles.card, { borderColor: theme.border }]}
    >
      <CachedImage uri={listing.imageUrl} style={styles.image} accessibilityLabel={listing.title} />
      <View style={styles.body}>
        <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
          {listing.title}
        </Text>
        <Text style={[styles.price, { color: theme.text }]}>
          {listing.currency} {(listing.priceCents / 100).toFixed(2)}
        </Text>
      </View>
      <Pressable
        onPress={onToggleFavourite}
        accessibilityRole="button"
        accessibilityLabel={isFavourited ? 'Remove from favourites' : 'Add to favourites'}
        hitSlop={8}
        style={styles.favouriteButton}
      >
        <Text style={{ fontSize: 18 }}>{isFavourited ? '♥' : '♡'}</Text>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 12, overflow: 'hidden', margin: 8, flex: 1 },
  image: { width: '100%', aspectRatio: 1, backgroundColor: '#E2E8F0' },
  body: { padding: 8 },
  title: { fontSize: 14, fontWeight: '600' },
  price: { fontSize: 13, marginTop: 2 },
  favouriteButton: { position: 'absolute', top: 8, right: 8, backgroundColor: '#FFFFFFCC', borderRadius: 14, padding: 4 },
});
