import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Platform, StyleSheet, Text } from 'react-native';

import { fontSize, fontWeight, radius, spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

const VISIBLE_MS = 2000;

const ToastContext = createContext<((message: string) => void) | null>(null);

// One toast host for the whole app: any screen calls useToast()(message).
export function ToastProvider({ children }: { children: ReactNode }) {
  const { colors } = useTheme();
  const [message, setMessage] = useState('');
  const opacity = useRef(new Animated.Value(0)).current;
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const show = useCallback(
    (text: string) => {
      setMessage(text);
      clearTimeout(timer.current);
      Animated.timing(opacity, { toValue: 1, duration: 150, useNativeDriver: true }).start();
      timer.current = setTimeout(
        () => Animated.timing(opacity, { toValue: 0, duration: 250, useNativeDriver: true }).start(),
        VISIBLE_MS,
      );
      if (Platform.OS !== 'web') AccessibilityInfo.announceForAccessibility(text);
    },
    [opacity],
  );

  return (
    <ToastContext.Provider value={show}>
      {children}
      <Animated.View pointerEvents="none" style={[styles.toast, { opacity, backgroundColor: colors.text }]}>
        <Text style={[styles.text, { color: colors.background }]}>{message}</Text>
      </Animated.View>
    </ToastContext.Provider>
  );
}

export function useToast(): (message: string) => void {
  const show = useContext(ToastContext);
  if (!show) throw new Error('useToast must be used inside ToastProvider');
  return show;
}

const styles = StyleSheet.create({
  // Sits above the tab bar, centred.
  toast: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
  },
  text: { fontSize: fontSize.body, fontWeight: fontWeight.semibold },
});
