import React from 'react';
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';
import { useGame } from '../context/GameContext';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Results'>;

export default function ResultsScreen({ navigation }: Props) {
  const { player, results, totalScore, clearData, setPlayer } = useGame();
  
  const getColorEmoji = (color: string) => {
    switch (color) {
      case 'verde': return '🟢';
      case 'laranja': return '🟠';
      case 'vermelho': return '🔴';
      default: return '⚪';
    }
  };

  const handlePlayAgain = async () => {
  await clearData();
  navigation.navigate('WaitingRoom');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏆 Resultados</Text>
      
      <View style={styles.playerInfo}>
        <Text style={styles.playerName}>{player?.name}</Text>
        <Text style={[styles.teamName, { color: player?.team === 'Azul' ? '#2196f3' : '#e53935' }]}>
          Equipe {player?.team}
        </Text>
      </View>

      <View style={styles.scoreContainer}>
        <Text style={styles.scoreLabel}>Pontuação Total</Text>
        <Text style={styles.totalScore}>{totalScore}</Text>
        <Text style={styles.scoreSubtext}>pontos</Text>
      </View>

      <ScrollView style={styles.resultsContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.resultsTitle}>QR Codes Escaneados:</Text>
        {results.length === 0 ? (
          <Text style={styles.noResults}>Nenhum QR Code foi escaneado</Text>
        ) : (
          results.map((result, index) => (
            <View key={index} style={styles.resultItem}>
              <View style={styles.resultHeader}>
                <Text style={styles.resultEmoji}>{getColorEmoji(result.color)}</Text>
                <Text style={styles.resultColor}>{result.color.toUpperCase()}</Text>
                <Text style={styles.resultPoints}>+{result.points} pts</Text>
              </View>
              <Text style={styles.resultDate}>
                {new Date(result.date).toLocaleTimeString('pt-BR')}
              </Text>
            </View>
          ))
        )}
      </ScrollView>

      <View style={styles.buttonContainer}>
        <Button
          title="Jogar Novamente"
          onPress={handlePlayAgain}
          color="#4CAF50"
        />
        <Button
          title="Sair"
          color="#e53935"
          onPress={async () => {
            await setPlayer(null);
            await clearData();
            navigation.navigate('Register');
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
    color: '#333',
  },
  playerInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  playerName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  teamName: {
    fontSize: 18,
    fontWeight: '600',
  },
  scoreContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scoreLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  totalScore: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  scoreSubtext: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  noResults: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    fontStyle: 'italic',
    marginTop: 32,
  },
  resultItem: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  resultEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  resultColor: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    color: '#333',
  },
  resultPoints: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  resultDate: {
    fontSize: 14,
    color: '#666',
    marginLeft: 28,
  },
  buttonContainer: {
    marginTop: 16,
  },
});