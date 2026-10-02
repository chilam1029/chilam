import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

export function MochiCharacter({ label, reactionKey }: { label: string; reactionKey: number }) {
  const idle = useRef(new Animated.Value(0)).current;
  const reaction = useRef(new Animated.Value(0)).current;
  const hasMounted = useRef(false);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(idle, {
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          isInteraction: false,
          toValue: 1,
          useNativeDriver: true
        }),
        Animated.timing(idle, {
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          isInteraction: false,
          toValue: 0,
          useNativeDriver: true
        })
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [idle]);

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }

    reaction.stopAnimation();
    reaction.setValue(0);
    Animated.sequence([
      Animated.timing(reaction, { duration: 150, easing: Easing.out(Easing.quad), toValue: 1, useNativeDriver: true }),
      Animated.timing(reaction, { duration: 120, easing: Easing.inOut(Easing.quad), toValue: 2, useNativeDriver: true }),
      Animated.timing(reaction, { duration: 180, easing: Easing.out(Easing.quad), toValue: 3, useNativeDriver: true })
    ]).start();
  }, [reaction, reactionKey]);

  return (
    <View style={styles.card}>
      <Animated.View
        style={{
          transform: [
            { translateY: reaction.interpolate({ inputRange: [0, 1, 2, 3], outputRange: [0, -16, 5, 0] }) },
            { rotate: reaction.interpolate({ inputRange: [0, 1, 2, 3], outputRange: ['0deg', '-3deg', '2deg', '0deg'] }) }
          ]
        }}
      >
        <Animated.View
          style={{
            transform: [
              { translateY: idle.interpolate({ inputRange: [0, 1], outputRange: [0, -4] }) },
              { scale: idle.interpolate({ inputRange: [0, 1], outputRange: [1, 1.018] }) }
            ]
          }}
        >
          <Animated.Image
            accessibilityLabel="Mochi, an orange and white cat companion"
            resizeMode="contain"
            source={require('../../assets/mochi-character.png')}
            style={styles.mochi}
          />
        </Animated.View>
      </Animated.View>
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
