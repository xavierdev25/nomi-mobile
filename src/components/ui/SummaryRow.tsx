import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/theme/tokens';

type SummaryRowProps = {
  label: string;
  value: string;
  bold?: boolean;
  color?: string;
};

export const SummaryRow = React.memo(({ label, value, bold = false, color }: SummaryRowProps) => (
  <View style={styles.row}>
    <Text style={[styles.label, bold && styles.strong, color ? { color } : undefined]}>
      {label}
    </Text>
    <Text style={[styles.value, bold && styles.strong, color ? { color } : undefined]}>
      {value}
    </Text>
  </View>
));
SummaryRow.displayName = 'SummaryRow';

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: { color: Colors.gray[600], fontSize: 14 },
  value: { color: Colors.blue[900], fontSize: 14, fontWeight: '700' },
  strong: { color: Colors.blue[900], fontSize: 17, fontWeight: '800' },
});
