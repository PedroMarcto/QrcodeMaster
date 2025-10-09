import React from 'react';
import { BackHandler } from 'react-native';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useGame } from '../context/GameContext';

const WaitingRoomScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { player, status, teams, setPlayer } = useGame();

    React.useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => backHandler.remove();
  }, []);

  React.useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const handleLeave = async () => {
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
      setPlayer(null);
      navigation.replace('Register');
    } catch (err) {
      console.error('Erro ao sair:', err);
    }
  };

  React.useEffect(() => {
    if (status === 'active') {
      navigation.navigate('Game');
    }
  }, [status, navigation]);

  // Encontrar a equipe do jogador (estrutura objeto)
  let playerTeamName = '';
  let teammates: string[] = [];
  if (teams && player?.name) {
    Object.entries(teams).forEach(([teamName, teamData]: any) => {
      if (Array.isArray(teamData.players) && teamData.players.includes(player.name)) {
        playerTeamName = teamName;
        teammates = teamData.players.filter((p: string) => p !== player.name);
      }
    });
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.leaveButtonTop} onPress={handleLeave}>
        <Text style={styles.leaveButtonText}>Sair</Text>
      </TouchableOpacity>
      <View style={styles.contentContainer}>
        <Image 
          source={require('../../assets/splash-icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Sala de Espera</Text>
        <Text style={styles.subtitle}>Bem-vindo, {player?.name || 'Jogador'}!</Text>
        {teams && (
          <View style={styles.teamsRow}>
            {(['blue', 'red'] as const).map((teamName) => {
              const teamData = teams[teamName as 'blue' | 'red'];
              const teamColor = teamName === 'blue' ? '#2563eb' : '#dc2626';
              const teamLabel = teamName === 'blue' ? 'Azul' : 'Vermelho';
              return (
                <View key={teamName} style={styles.teamColumn}>
                  <Text style={[styles.teamTitle, { color: teamColor }]}> 
                    {teamLabel}
                  </Text>
                  <View style={styles.playersBox}>
                    {Array.isArray(teamData?.players) && teamData.players.length > 0 ? (
                      teamData.players.map((playerName: string, idx: number) => (
                        <View key={idx} style={styles.playerRow}>
                          <View style={[styles.playerDot, { backgroundColor: teamColor }]} />
                          <Text style={styles.playerName}>{playerName}</Text>
                        </View>
                      ))
                    ) : (
                      <Text style={styles.noPlayer}>Nenhum jogador.</Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}
        <Text style={styles.status}>Aguardando início do jogo...</Text>
      </View>      <View style={styles.footer}>
        <Text style={styles.footerTitle}>QrMaster Beta</Text>
        <Text style={styles.footerSubtitle}>Desenvolvido para Fatech 2025</Text>
        <Text style={styles.footerAuthor}>
          Copyright 2025 Pedro Otávio Rodrigues Marcato
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginVertical: 2,
    width: '90%',
    alignSelf: 'center',
  },
  playerDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 8,
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 80,
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    marginBottom: 24,
    textAlign: 'center',
  },
  teamsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 16,
    gap: 16,
  },
  teamColumn: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    alignItems: 'center',
  },
  teamTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 8,
    color: '#3b82f6',
    textAlign: 'center',
  },
  playersBox: {
    width: '100%',
    alignItems: 'center',
  },
  playerName: {
    fontSize: 16,
    color: '#222',
    textAlign: 'left',
    paddingHorizontal: 0,
    paddingVertical: 0,
    backgroundColor: 'transparent',
    borderRadius: 0,
  },
  noPlayer: {
    fontStyle: 'italic',
    color: '#888',
    marginTop: 4,
  },
  status: {
    fontSize: 16,
    marginTop: 32,
    color: '#888',
    textAlign: 'center',
  },
  leaveButtonTop: {
    position: 'absolute',
    top: 32,
    right: 24,
    backgroundColor: '#dc2626',
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
    zIndex: 10,
  },
  leaveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'center',
    width: 411,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 4,
  },
  footerTitle: {
    fontSize: 14,
    color: '#27ae60',
    textAlign: 'center',
    fontWeight: 'bold',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  footerSubtitle: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 4,
  },
  footerAuthor: {
    fontSize: 11,
    color: '#95a5a6',
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default WaitingRoomScreen;
