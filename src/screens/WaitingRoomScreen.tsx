import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useGame } from '../context/GameContext';

const WaitingRoomScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { player, status } = useGame();

  React.useEffect(() => {
    if (status === 'active') {
      navigation.navigate('Game');
    }
  }, [status, navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sala de Espera</Text>
      <Text style={styles.subtitle}>Bem-vindo, {player?.name || 'Jogador'}!</Text>
      <Text style={styles.status}>Aguardando início do jogo...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 20,
    marginBottom: 24,
  },
  status: {
    fontSize: 16,
    marginBottom: 32,
    color: '#888',
  },
});

export default WaitingRoomScreen;
