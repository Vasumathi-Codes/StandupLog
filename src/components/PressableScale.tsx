import { ReactNode, useRef } from 'react';
import { Animated, Pressable, PressableProps, StyleProp, StyleSheet, ViewStyle } from 'react-native';

type Props = Omit<PressableProps, 'style' | 'children'> & {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  scaleTo?: number;
};

// Pressable that shrinks slightly while held: the subtle press feedback used by every button.
export function PressableScale({ children, style, scaleTo = 0.97, onPressIn, onPressOut, ...rest }: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const animateTo = (toValue: number) =>
    Animated.timing(scale, { toValue, duration: 90, useNativeDriver: true }).start();

  // Layout props that decide how the button shares space with its siblings must go on the
  // outer Pressable (the thing the parent lays out), not on the animated view inside it.
  const { flex, flexGrow, flexShrink, flexBasis, alignSelf, ...innerStyle } = StyleSheet.flatten(style) ?? {};

  return (
    <Pressable
      {...rest}
      style={{ flex, flexGrow, flexShrink, flexBasis, alignSelf }}
      onPressIn={(event) => {
        animateTo(scaleTo);
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        animateTo(1);
        onPressOut?.(event);
      }}>
      <Animated.View style={[innerStyle, { transform: [{ scale }] }]}>{children}</Animated.View>
    </Pressable>
  );
}
