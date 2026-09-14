import React from 'react';
import { Image, ImageStyle, StyleProp } from 'react-native';

interface Props {
  uri?: string;
  style?: StyleProp<ImageStyle>;
  accessibilityLabel?: string;
}

/**
 * Wraps whichever caching image library you pick, so the rest of the app
 * imports THIS file, not 'react-native-fast-image' directly - swapping
 * libraries later (e.g. to expo-image, which has built-in disk caching)
 * means editing one file, not every screen that shows a listing photo.
 *
 * react-native's core <Image> already does some memory caching, which is
 * fine to start with; swap to FastImage/expo-image once you're profiling
 * real scroll-performance issues with a large listings feed, not before.
 */
export function CachedImage({ uri, style, accessibilityLabel }: Props) {
  if (!uri) {
    return <Image style={style} accessibilityLabel={accessibilityLabel} source={require('../../../assets/placeholder.png')} />;
  }
  return (
    <Image
      style={style}
      source={{ uri, cache: 'force-cache' }}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="image"
    />
  );
}
