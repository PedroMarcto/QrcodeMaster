import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useGame } from '../context/GameContext';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { isTablet, scale, spacing, getMaxWidth } from '../utils/responsive';

type Props = NativeStackScreenProps<RootStackParamList, 'Results'>;

export default function ResultsScreen({ navigation }: Props) {
  React.useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);
  const { player, results, teams, clearData, setPlayer } = useGame();

  // Converte o nome da equipe para o formato usado no Firebase
  const teamKey = player?.team === 'Azul' ? 'blue' : 'red';
  
  // Filtra os QR Codes escaneados pela equipe do jogador
  const teamResults = results.filter(result => result.team === teamKey);
  
  const getColorEmoji = (color: string) => {
    switch (color) {
      case 'verde': return '🟢';
      case 'laranja': return '🟠';
      case 'vermelho': return '🔴';
      default: return '⚪';
    }
  };

  const teamScore = teams[teamKey]?.score ?? 0;
  // Detecta se a equipe venceu (exemplo: maior pontuação)
  const resultStatus = (() => {
    const blueScore = teams.blue?.score ?? 0;
    const redScore = teams.red?.score ?? 0;
    if (blueScore === redScore) return 'draw';
    if (teamKey === 'blue') return blueScore > redScore ? 'win' : 'lose';
    if (teamKey === 'red') return redScore > blueScore ? 'win' : 'lose';
    return 'lose';
  })();

  return (
    <View style={styles.container}>
      <View style={styles.contentWrapper}>
        {/* Banner animado de vitória/derrota */}
        <View style={styles.bannerWrapper}>
          {resultStatus === 'draw' ? (
            <View style={styles.drawBanner}>
              <MaterialCommunityIcons name="handshake" size={38} color="#ffffffff" style={{marginRight: 12}} />
              <Text style={styles.drawBannerText}>EMPATE!</Text>
              <Text style={styles.finalScoreText}>
                Pontuação Final: Azul {teams.blue?.score ?? 0} x {teams.red?.score ?? 0} Vermelha
              </Text>
            </View>
          ) : (
            (() => {
              const winner = teams.blue?.score > teams.red?.score ? 'AZUL' : 'VERMELHA';
              const bannerStyle = winner === 'AZUL' ? styles.blueBanner : styles.redBanner;
              const textStyle = winner === 'AZUL' ? styles.blueBannerText : styles.redBannerText;
              const trophyColor = winner === 'AZUL' ? '#ffffffff' : '#ffffffff';
              return (
                <View style={bannerStyle}>
                  <MaterialCommunityIcons name="trophy" size={38} color={trophyColor} style={{marginRight: 12}} />
                  <Text style={textStyle}>EQUIPE {winner} VENCEU!</Text>
                  <Text style={styles.finalScoreText}>
                    Pontuação Final: Azul {teams.blue?.score ?? 0} x {teams.red?.score ?? 0} Vermelha
                  </Text>
                </View>
              );
            })()
          )}
        </View>

        {/* Card do jogador */}
        <View style={styles.playerCard}>
          <MaterialCommunityIcons name="account" size={50} color="#2196f3" />
          <Text style={styles.playerNameBig}>{player?.name}</Text>
          <Text style={[styles.teamBadge, { backgroundColor: player?.team === 'Azul' ? '#2196f3' : '#e53935' }]}>
            {player?.team?.toUpperCase()}
          </Text>
        </View>

        {/* Pontuação animada */}
        <View style={styles.scoreCard}>
          <Text style={styles.scoreLabel}>Pontuação da Equipe</Text>
          <Text style={styles.scoreBig}>{teamScore} <Text style={{fontSize: scale(16)}}>pontos</Text></Text>
          
        </View>

        {/* Cards dos QR Codes */}
        <ScrollView style={styles.resultsContainer} showsVerticalScrollIndicator={false}>
          <Text style={styles.resultsTitle}>Tesouros encontrados pela equipe:</Text>
          {teamResults.length === 0 ? (
            <Text style={styles.noResults}>Nenhum QR Code foi escaneado pela equipe</Text>
          ) : (
            <View style={styles.qrCardsWrapper}>
              {teamResults.map((result, index) => (
                <View key={index} style={[styles.qrCard, { borderColor: result.color === 'verde' ? '#2ecc40' : result.color === 'laranja' ? '#ff9800' : '#e53935' }] }>
                  <Text style={styles.qrEmoji}>{getColorEmoji(result.color)}</Text>
                  <Text style={styles.qrColor}>{result.color.toUpperCase()}</Text>
                  <Text style={styles.qrPoints}>+{result.points} pts</Text>
                  <Text style={styles.qrDate}>{new Date(result.date).toLocaleTimeString('pt-BR')}</Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Botão de sair estilizado */}
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
  bannerWrapper: {
    alignItems: 'center',
    marginBottom: spacing(10),
  },
  finalScoreText: {
    fontSize: scale(16),
    color: '#fff',
    fontWeight: 'bold',
    marginTop: spacing(8),
    textAlign: 'center',
  },
  blueBanner: {
    backgroundColor: '#2563eb',
    borderRadius: spacing(16),
    padding: spacing(16),
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'center',
    marginBottom: spacing(12),
  },
  blueBannerText: {
    fontSize: scale(22),
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  redBanner: {
    backgroundColor: '#e53935',
    borderRadius: spacing(16),
    padding: spacing(16),
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'center',
    marginBottom: spacing(12),
  },
  redBannerText: {
    fontSize: scale(22),
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  drawBanner: {
    backgroundColor: '#f59e42',
    borderRadius: spacing(16),
    padding: spacing(16),
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'center',
    marginBottom: spacing(12),
  },
  drawBannerText: {
    fontSize: scale(22),
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  winnerEmoji: {
    fontSize: scale(32),
    marginRight: spacing(12),
  },
  winnerBannerText: {
    fontSize: scale(22),
    fontWeight: 'bold',
    color: '#ff9800',
    letterSpacing: 1,
  },
  loserBanner: {
    backgroundColor: '#e3e3e3',
    borderRadius: spacing(16),
    padding: spacing(16),
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing(8),
    borderWidth: 2,
    borderColor: '#bdbdbd',
  },
  loserEmoji: {
    fontSize: scale(32),
    marginRight: spacing(12),
  },
  loserBannerText: {
    fontSize: scale(22),
    fontWeight: 'bold',
    color: '#757575',
    letterSpacing: 1,
  },
  playerCard: {
    backgroundColor: '#fff',
    borderRadius: spacing(16),
    borderBottomEndRadius: spacing(0),
    borderBottomStartRadius: spacing(0),
    alignItems: 'center',
    padding: spacing(18),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  playerAvatar: {
    fontSize: scale(38),
    marginBottom: spacing(6),
  },
  playerNameBig: {
    fontSize: scale(24),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: spacing(4),
  },
  teamBadge: {
    fontSize: scale(16),
    color: '#fff',
    fontWeight: 'bold',
    paddingHorizontal: spacing(12),
    paddingVertical: spacing(4),
    borderRadius: spacing(12),
    marginTop: spacing(2),
    letterSpacing: 1,
  },
  scoreCard: {
    backgroundColor: '#e3fcec',
    borderRadius: spacing(16),
    borderTopEndRadius: spacing(0),
    borderTopStartRadius: spacing(0),
    alignItems: 'center',
    padding: spacing(18),
    marginBottom: spacing(12),
    borderWidth: 0.5,
    borderColor: '#4CAF50',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scoreLabel: {
    fontSize: scale(18),
    color: '#388e3c',
    marginBottom: spacing(8),
    fontWeight: 'bold',
  },
  scoreBig: {
    fontSize: scale(54),
    fontWeight: 'bold',
    color: '#43a047',
    textShadowColor: '#c8e6c9',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  scoreSubtext: {
    fontSize: scale(16),
    color: '#666',
    marginTop: spacing(4),
  },
  qrCardsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing(8),
    marginTop: spacing(8),
    marginBottom: spacing(20),
  },
  qrCard: {
    backgroundColor: '#fff',
    borderRadius: spacing(14),
    padding: spacing(14),
    marginBottom: spacing(8),
    alignItems: 'center',
    minWidth: 120,
    maxWidth: 140,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  qrEmoji: {
    fontSize: scale(28),
    marginBottom: spacing(2),
  },
  qrColor: {
    fontSize: scale(15),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: spacing(2),
  },
  qrPoints: {
    fontSize: scale(15),
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: spacing(2),
  },
  qrDate: {
    fontSize: scale(13),
    color: '#666',
  },
  container: {
    paddingTop: spacing(15),
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: spacing(16),
    alignItems: 'center',
  },
  contentWrapper: {
    flex: 1,
    width: '100%',
    maxWidth: getMaxWidth(),
  },
  title: {
    fontSize: scale(35),
    textAlign: 'center',
    marginBottom: spacing(35),
    color: '#2a9b13ff',
    letterSpacing: 1,
    textTransform: 'uppercase',
    textShadowRadius: 3,
    padding: spacing(8),
    borderRadius: spacing(12),
    borderWidth: 1,
    borderColor: '#008807ff',
  },
  playerInfo: {
    alignItems: 'center',
    marginBottom: spacing(2),
  },
  playerName: {
    fontSize: scale(20),
    fontWeight: '100',
    color: '#333',
    marginBottom: spacing(4),
  },
  playerLabel: {
    fontSize: scale(21),
    fontWeight: 'bold',
    paddingHorizontal: spacing(10),
    paddingVertical: spacing(2),
    borderRadius: spacing(5),
  },
  teamName: {
    fontSize: scale(18),
    fontWeight: '600',
  },
  scoreContainer: {
    backgroundColor: '#fff',
    borderRadius: spacing(16),
    padding: spacing(24),
    alignItems: 'center',
    marginBottom: spacing(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  standMessageWrapper: {
    alignItems: 'center',
    marginBottom: spacing(10),
    marginTop: spacing(-4),
  },
  standMessageText: {
    fontSize: scale(17),
    color: '#1a237e',
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: '#e3eafc',
    padding: spacing(10),
    borderRadius: spacing(10),
    borderWidth: 1,
    borderColor: '#90caf9',
    marginHorizontal: spacing(8),
    letterSpacing: 1,
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: spacing(16),
    padding: spacing(16),
    marginBottom: spacing(16),
  },
  resultsTitle: {
    fontSize: scale(18),
    fontWeight: 'bold',
    marginBottom: spacing(16),
    margin: 'auto',
    color: '#333',
  },
  noResults: {
    textAlign: 'center',
    color: '#666',
    fontSize: scale(16),
    fontStyle: 'italic',
    marginTop: spacing(32),
  },
  resultItem: {
    backgroundColor: '#f9f9f9',
    borderRadius: spacing(12),
    padding: spacing(16),
    marginBottom: spacing(12),
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing(4),
  },
  resultEmoji: {
    fontSize: scale(20),
    marginRight: spacing(8),
  },
  resultColor: {
    fontSize: scale(16),
    fontWeight: 'bold',
    flex: 1,
    color: '#333',
  },
  resultPoints: {
    fontSize: scale(16),
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  resultDate: {
    fontSize: scale(14),
    color: '#666',
    marginLeft: spacing(28),
  },
  exitBtn: {
    backgroundColor: '#e53935',
    borderRadius: spacing(25),
    paddingVertical: spacing(16),
    alignItems: 'center',
    marginTop: spacing(5),
    marginBottom: spacing(5),
    width: '100%',
  },
  exitText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: scale(18),
    letterSpacing: 1,
  },
});