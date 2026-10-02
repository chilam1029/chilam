import { Image, StyleSheet, Text, View } from 'react-native';

export function MochiCharacter({ label }: { label: string }) {
  return (
    <View style={styles.card}>
      <Image
        accessibilityLabel="Mochi, an orange and white cat companion"
        resizeMode="contain"
        source={require('../../assets/mochi-character.png')}
        style={styles.mochi}
      />
      <View style={styles.message}>
        <Text style={styles.label}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: '#EDE1CD',
    borderColor: '#DED1BA',
    borderRadius: 28,
    borderWidth: 1,
    overflow: 'hidden',
    paddingHorizontal: 18,
    paddingTop: 12
  },
  mochi: { height: 260, width: '100%' },
  message: {
    backgroundColor: '#FFFEFA',
    borderColor: '#DED6C7',
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 18,
    marginTop: -4,
    paddingHorizontal: 16,
    paddingVertical: 11
  },
  label: { color: '#5C574F', fontSize: 14, fontWeight: '600', textAlign: 'center' }
});
