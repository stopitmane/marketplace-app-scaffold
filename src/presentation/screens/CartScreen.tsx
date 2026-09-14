import React from 'react';
import { View, Text, FlatList, Pressable } from 'react-native';
import { useCartViewModel } from '../viewmodels/useCartViewModel';
import { LoadingState, EmptyState, ErrorState } from '../components/States';
import { useTheme } from '../components/useTheme';

interface Props {
  onCheckout: () => void;
}

export function CartScreen({ onCheckout }: Props) {
  const theme = useTheme();
  const { state, retry, removeItem } = useCartViewModel();

  if (state.status === 'loading') return <LoadingState />;
  if (state.status === 'error') return <ErrorState error={state.error} onRetry={retry} />;
  if (state.status === 'empty') return <EmptyState title="Your cart is empty" subtitle="Browse listings to add something." />;

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <FlatList
        data={state.cart.items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: theme.border }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: theme.text, fontWeight: '600' }}>{item.title}</Text>
              <Text style={{ color: theme.textMuted }}>Qty {item.quantity}</Text>
            </View>
            <Text style={{ color: theme.text }}>
              {item.currency} {(item.lineTotalCents / 100).toFixed(2)}
            </Text>
            <Pressable onPress={() => removeItem(item.id)} accessibilityRole="button" accessibilityLabel={`Remove ${item.title}`} hitSlop={8} style={{ marginLeft: 12 }}>
              <Text style={{ color: theme.accent }}>Remove</Text>
            </Pressable>
          </View>
        )}
      />
      <View style={{ padding: 16, borderTopWidth: 1, borderTopColor: theme.border }}>
        <Text style={{ color: theme.text, fontSize: 16, fontWeight: '700', marginBottom: 12 }}>
          Total: {state.cart.items[0]?.currency} {(state.cart.totalCents / 100).toFixed(2)}
        </Text>
        <Pressable
          onPress={onCheckout}
          accessibilityRole="button"
          accessibilityLabel="Checkout"
          style={{ backgroundColor: theme.accent, padding: 14, borderRadius: 8, alignItems: 'center' }}
        >
          <Text style={{ color: '#fff', fontWeight: '700' }}>Checkout</Text>
        </Pressable>
      </View>
    </View>
  );
}
