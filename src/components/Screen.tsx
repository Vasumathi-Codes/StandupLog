import { ReactNode } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Edge, SafeAreaView } from 'react-native-safe-area-context';

import { spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

// Shared page shell: themed background, safe area (notch) at the top, scrolling content.
// The bottom safe area is handled by the tab bar.
export function Screen({ children, edges = ['top'] }: { children: ReactNode; edges?: Edge[] }) {
  const { colors } = useTheme();
  return (
    <SafeAreaView edges={edges} style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
        showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.xl },
});
