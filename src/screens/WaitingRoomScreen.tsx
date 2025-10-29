import React from 'react';
import { BackHandler, Dimensions } from 'react-native';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useGame } from '../context/GameContext';
import { isTablet, scale, spacing, imageSize, getMaxWidth } from '../utils/responsive';
import { MaterialCommunityIcons } from '@expo/vector-icons';

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
        <MaterialCommunityIcons name="arrow-left" size={20} color="#ffffffff" />
        <Text style={styles.leaveButtonText}>Sair</Text>
      </TouchableOpacity>
      
      <View style={styles.contentWrapper}>
        {isTablet() ? (
          // Layout para Tablet (2 colunas)
          <View style={styles.tabletLayout}>
            <View style={styles.leftColumn}>
              <Image 
                source={require('../../assets/splash-icon.png')}
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={styles.title}>Sala de Espera</Text>
              <Text style={styles.subtitle}>Bem-vindo, {player?.name || 'Jogador'}!</Text>
              <Text style={styles.status}>Aguardando início do jogo...</Text>
            </View>

            <View style={styles.rightColumn}>
              {teams && (
                <View style={styles.teamsRow}>
                  {(['blue', 'red'] as const).map((teamName) => {
                    const teamData = teams[teamName as 'blue' | 'red'];
                    const teamColor = teamName === 'blue' ? '#2563eb' : '#dc2626';
                    const teamLabel = teamName === 'blue' ? 'Azul' : 'Vermelho';
                    return (
                      <View key={teamName} style={styles.teamColumn}>
                        <Text style={[styles.teamTitle, { color: teamColor, flexDirection: 'row', alignItems: 'center' }]}> 
                          <MaterialCommunityIcons name="account-group" size={22} color={teamColor} style={{ marginRight: 6 }} />
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
            </View>
          </View>
        ) : (
          // Layout para Smartphone (1 coluna)
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
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                        <MaterialCommunityIcons name="account-group" size={22} color={teamColor} style={{ marginRight: 6 }} />
                        <Text style={[styles.teamTitle, { color: teamColor }]}>
                          {teamLabel}
                        </Text>
                      </View>
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
            <Text style={styles.status}>Aguardando o início da caçada...</Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerTitle}>QrcodeMaster Beta</Text>
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
    marginVertical: spacing(2),
    width: '100%',
    paddingVertical: spacing(1),
  },
  playerDot: {
    width: spacing(10),
    height: spacing(10),
    borderRadius: spacing(5),
    marginRight: spacing(8),
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentWrapper: {
    flex: 1,
    width: '100%',
    maxWidth: isTablet() ? 900 : getMaxWidth(),
    alignSelf: 'center',
    paddingHorizontal: spacing(20),
    paddingTop: isTablet() ? spacing(10) : spacing(16),
    paddingBottom: spacing(120),
  },
  // Layout específico para Tablet
  tabletLayout: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftColumn: {
    flex: 0.9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: spacing(15),
  },
  rightColumn: {
    flex: 1.1,
    justifyContent: 'center',
    paddingLeft: spacing(15),
  },
  // Layout para Smartphone
  contentContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: spacing(80),
  },
  logo: {
    width: isTablet() ? imageSize(150) : imageSize(200),
    height: isTablet() ? imageSize(150) : imageSize(200),
    marginBottom: isTablet() ? spacing(8) : spacing(16),
  },
  title: {
    fontSize: isTablet() ? scale(22) : scale(28),
    fontWeight: 'bold',
    marginBottom: isTablet() ? spacing(6) : spacing(16),
    textAlign: 'center',
    color: '#2c3e50',
  },
  subtitle: {
    fontSize: isTablet() ? scale(16) : scale(20),
    marginBottom: isTablet() ? spacing(8) : spacing(24),
    textAlign: 'center',
    color: '#34495e',
  },
  teamsRow: {
    flexDirection: isTablet() ? 'column' : 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: spacing(16),
    marginBottom: isTablet() ? spacing(40) : spacing(16),
  },
  teamColumn: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: spacing(10),
    padding: spacing(12),
    marginHorizontal: isTablet() ? 0 : spacing(8),
    marginVertical: isTablet() ? spacing(4) : 0,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    alignItems: 'flex-start',
    minHeight: isTablet() ? spacing(90) : spacing(100),
    maxHeight: isTablet() ? spacing(200) : spacing(150),
  },
  teamTitle: {
    fontWeight: 'bold',
    fontSize: isTablet() ? scale(16) : scale(18),
    color: '#3b82f6',
  },
  playersBox: {
    width: '100%',
    alignItems: 'flex-start',
    paddingHorizontal: spacing(4),
  },
  playerName: {
    fontSize: isTablet() ? scale(14) : scale(16),
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
    marginTop: spacing(4),
    fontSize: scale(14),
  },
  status: {
    fontSize: isTablet() ? scale(16) : scale(16),
    marginTop: isTablet() ? spacing(20) : spacing(32),
    color: '#888',
    textAlign: 'center',
    fontWeight: '600',
  },
  leaveButtonTop: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    top: spacing(32),
    right: spacing(24),
    backgroundColor: '#dc2626',
    paddingVertical: spacing(10),
    paddingHorizontal: spacing(20),
    paddingLeft: spacing(15),
    borderRadius: spacing(20),
    zIndex: 10,
  },
  leaveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: scale(16),
    marginLeft: spacing(8),
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    paddingVertical: spacing(16),
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'center',
    width: Dimensions.get('window').width,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 4,
  },
  footerTitle: {
    fontSize: scale(14),
    color: '#27ae60',
    textAlign: 'center',
    fontWeight: 'bold',
    letterSpacing: 0.5,
    marginBottom: spacing(2),
  },
  footerSubtitle: {
    fontSize: scale(12),
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: spacing(4),
  },
  footerAuthor: {
    fontSize: scale(11),
    color: '#95a5a6',
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default WaitingRoomScreen;
