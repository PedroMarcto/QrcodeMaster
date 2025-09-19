import React from 'react';
import { View, Text, Button, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useGame } from '../context/GameContext';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Results'>;

export default function ResultsScreen({ navigation }: Props) {
  React.useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);
  const { player, results, teams, clearData, setPlayer } = useGame();

  // Filtra os QR Codes escaneados pela equipe do jogador
  const teamResults = results.filter(result => result.team === player?.team);
  
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

  const teamKey = player?.team === 'Azul' ? 'blue' : 'red';
  const teamScore = teams[teamKey]?.score ?? 0;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Resumo da partida</Text>
      
      <View style={styles.playerInfo}>
        <View style={styles.playerRow}>
          <Text style={styles.playerLabel}>Jogador: <Text style={styles.playerName}>{player?.name}</Text></Text>
          <Text style={[styles.teamName, { color: player?.team === 'Azul' ? '#2196f3' : '#e53935' }, { backgroundColor: player?.team === 'Azul' ? '#2196f340' : '#e5393540', paddingHorizontal: 15, paddingVertical: 4, paddingBottom: 7, borderRadius: 20,}]}>
            Equipe {player?.team}
          </Text>
        </View>
      </View>

      <View style={styles.scoreContainer}>
        <Text style={styles.scoreLabel}>Pontuação da Equipe</Text>
        <Text style={styles.totalScore}>{teamScore}</Text>
        <Text style={styles.scoreSubtext}>pontos</Text>
      </View>

      <Text style={styles.winnerText}>Vá ao estande para saber o Ganhador</Text>

      <ScrollView style={styles.resultsContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.resultsTitle}>QR Codes Escaneados:</Text>
        {teamResults.length === 0 ? (
          <Text style={styles.noResults}>Nenhum QR Code foi escaneado pela equipe</Text>
        ) : (
          teamResults.map((result, index) => (
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

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.playAgainBtn} onPress={handlePlayAgain} activeOpacity={0.85}>
          <Text style={styles.playAgainText}>JOGAR NOVAMENTE</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.exitBtn} onPress={async () => {
          if (!player) return;
          const teamKey = player.team === 'Azul' ? 'blue' : 'red';
          try {
            const { doc, getDoc, setDoc } = await import('firebase/firestore');
            const gameDocRef = doc(require('../config/firebase').db, 'game', 'current');
            const docSnap = await getDoc(gameDocRef);
            if (docSnap.exists()) {
              const data = docSnap.data();
              const teamsData = { ...data.teams };
              teamsData[teamKey].players = teamsData[teamKey].players.filter((n: string) => n !== player.name);
              await setDoc(gameDocRef, { teams: teamsData }, { merge: true });
            }
            await setPlayer(null);
            await clearData();
            navigation.replace('Register');
          } catch (err) {
            console.error('Erro ao sair:', err);
          }
        }} activeOpacity={0.85}>
          <Text style={styles.exitText}>SAIR</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  playerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  container: {
    paddingTop: 15,
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 35,
    textAlign: 'center',
    marginBottom: 35,
    color: '#2a9b13ff', // azul destaque
    letterSpacing: 1,
    textTransform: 'uppercase',
    textShadowRadius: 3,
    //backgroundColor: '#00ff8831',
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#008807ff',
  },
  playerInfo: {
    alignItems: 'center',
    marginBottom: 2,
  },
  playerName: {
    fontSize: 20,
    fontWeight: '100',
    color: '#333',
    marginBottom: 4,
  },
  playerLabel: {
    fontSize: 21,
    fontWeight: 'bold',
    //backgroundColor: '#dadadaff',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 5,
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
    marginBottom: 12,
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
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 5,
    gap: 12,
  },
  playAgainBtn: {
    flex: 2,
    backgroundColor: '#4CAF50',
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 8,
  },
  playAgainText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
  },
  exitBtn: {
    flex: 1,
    backgroundColor: '#e53935',
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: 'center',
    marginLeft: 8,
  },
  exitText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
  },
  winnerText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 12,
  },
});