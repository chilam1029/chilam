import { StyleSheet, Text, View } from 'react-native';

export function MochiPlaceholder({ label }: { label: string }) {
  return (
    <View style={styles.card}>
      <View style={styles.mochi} />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { alignItems: 'center', gap: 12, borderRadius: 28, padding: 24, backgroundColor: '#EDE1CD' },
  mochi: { width: 140, height: 140, borderRadius: 70, backgroundColor: '#C9B092' },
  label: { fontSize: 14, color: '#6C665C', fontWeight: '600' }
});
