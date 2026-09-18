import { Image, StyleSheet, Text, View } from 'react-native';

export function BrandSplash() {
  return (
    <View style={styles.root} accessibilityLabel="Iqra">
      <Image
        source={require('../../assets/images/splash-icon.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.title}>Iqra</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 160,
    height: 160,
  },
  title: {
    marginTop: 16,
    fontSize: 28,
    fontWeight: '700',
    color: '#111111',
    letterSpacing: 0.5,
  },
});
