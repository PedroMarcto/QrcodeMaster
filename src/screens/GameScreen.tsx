import React, { useState, useEffect } from 'react';
import { BackHandler } from 'react-native';
import { View, Text, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { CameraView, CameraType, Camera } from 'expo-camera';
import { useGame } from '../context/GameContext';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useNavigation } from '@react-navigation/native';
import { isTablet, scale, spacing } from '../utils/responsive';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const colorPoints = {
  verde: 1,
  laranja: 3,
  vermelho: 5,
};

const GAME_QR_PREFIX = 'GameQrcodeFach:';
// Aceita formato GameQrcodeFach:cor:uuid
const QR_REGEX = /^GameQrcodeFach:(verde|laranja|vermelho):([0-9a-fA-F\-]{36})$/;

type Props = NativeStackScreenProps<RootStackParamList, 'Game'>;

export default function GameScreen({ navigation }: Props) {
  const { setResults, results, player, timeRemaining, status, teams, isQRCodeScannedByTeam } = useGame();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [cameraRef, setCameraRef] = useState<any>(null);
  const nav = useNavigation();

  const teamKey = player?.team === 'Azul' ? 'blue' : 'red';
  const teamScore = teams[teamKey]?.score ?? 0;

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => backHandler.remove();
  }, []);

  React.useLayoutEffect(() => {
    nav.setOptions({ headerShown: false });
  }, [nav]);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);

    // Validação do formato
    const match = QR_REGEX.exec(data);
    if (!match) {
      Alert.alert(
        'QR Code inválido',
        'Este QR Code não faz parte do jogo GameQrcodeFach.\n\nProcure pelos QR codes oficiais do evento!',
        [{ text: 'OK', onPress: () => setScanned(false) }]
      );
      return;
    }

    const color = match[1] as 'verde' | 'laranja' | 'vermelho';
    const uuid = match[2];
    
    // Verifica se ESTA EQUIPE já escaneou este QR code
    if (player && isQRCodeScannedByTeam(uuid, player.team)) {
      Alert.alert(
        'QR Code já escaneado!',
        `Sua equipe já escaneou este QR Code!\n\nProcure por outros QR codes para ganhar mais pontos!`,
        [{ text: 'OK', onPress: () => setScanned(false) }]
      );
      return;
    }

    const points = colorPoints[color] || 0;
    // Salva com 'blue' ou 'red' para consistência no Firebase
    const teamKey = player?.team === 'Azul' ? 'blue' : 'red';
    const newResult = { color, points, date: new Date().toISOString(), id: uuid, team: teamKey };
    setResults([...results, newResult]);

    Alert.alert(
      '🎉 QR Code válido!',
      `Cor: ${color.toUpperCase()}\nPontos: +${points}\n\nContinue procurando pelos outros QR codes!`,
      [
        { text: 'Continuar', onPress: () => setScanned(false) }
      ]
    );
  };

  if (hasPermission === null) {
    return (
      <View style={styles.center}>
        <Text>Solicitando permissão para acessar a câmera...</Text>
      </View>
    );
  }
  if (hasPermission === false) {
    return (
      <View style={styles.center}>
        <Text>Permissão para câmera negada.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isTablet() ? (
        // Layout para Tablet
        <View style={styles.tabletLayout}>
          {/* Coluna Esquerda - Informações */}
          <View style={styles.leftColumn}>
            {/* Timer no topo */}
            <View style={styles.timerBox}>
              <Text style={styles.timerLabel}>Tempo:</Text>
              <Text style={styles.timerValue}>{Math.floor(timeRemaining / 60)}:{String(timeRemaining % 60).padStart(2, '0')}</Text>
            </View>

            {/* Informações do Jogador */}
            <View style={styles.playerInfoCard}>
              <Text style={styles.playerName}>{player?.name}</Text>
              <Text style={[styles.teamName, { color: player?.team === 'Azul' ? '#2196f3' : '#e53935' }]}>
                Equipe {player?.team}
              </Text>
            </View>

            {/* Pontuação da Equipe */}
            <View style={styles.scoreCard}>
              <Text style={styles.scoreLabel}>Pontuação</Text>
              <Text style={styles.score}>{teamScore}</Text>
            </View>

            {/* QR Codes Escaneados */}
            <View style={styles.qrCountCard}>
              <Text style={styles.qrCountLabel}>QR Codes</Text>
              <Text style={styles.qrCountValue}>{results.length}</Text>
            </View>

            {/* Sistema de Pontos */}
            <View style={styles.pointsCard}>
              <Text style={styles.pointsTitle}>Sistema de Pontos:</Text>
              <View style={styles.pointItem}>
                <View style={[styles.colorDot, { backgroundColor: 'green' }]} />
                <Text style={styles.pointText}>Verde: 1 ponto</Text>
              </View>
              <View style={styles.pointItem}>
                <View style={[styles.colorDot, { backgroundColor: 'orange' }]} />
                <Text style={styles.pointText}>Laranja: 3 pontos</Text>
              </View>
              <View style={styles.pointItem}>
                <View style={[styles.colorDot, { backgroundColor: 'red' }]} />
                <Text style={styles.pointText}>Vermelho: 5 pontos</Text>
              </View>
            </View>
          </View>

          {/* Coluna Direita - Scanner */}
          <View style={styles.rightColumn}>
            <View style={styles.scannerBox}>
              <CameraView
                ref={ref => setCameraRef(ref)}
                style={StyleSheet.absoluteFillObject}
                facing="back"
                barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                onBarcodeScanned={scanned || status === 'finished' ? undefined : handleBarCodeScanned}
              />
              <View style={styles.overlay}>
                <View style={styles.scanFrame} />
                <Text style={styles.scanInstruction}>
                  {status === 'finished' ? 'A partida foi encerrada!' : scanned ? 'QR Code detectado!' : 'Posicione o QR Code dentro do quadro'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      ) : (
        // Layout para Smartphone
        <>
          <View style={styles.header}>
            <View style={styles.timerBox}>
              <Text style={styles.timerLabel}>Tempo Restante:</Text>
              <Text style={styles.timerValue}>{Math.floor(timeRemaining / 60)}:{String(timeRemaining % 60).padStart(2, '0')}</Text>
            </View>
            <Text style={styles.qrCount}>QR Codes Escaneados: {results.length}</Text>
            <View style={styles.playerInfo}>
              <Text style={styles.playerName}>{player?.name}</Text>
              <Text style={[styles.teamName, { color: player?.team === 'Azul' ? '#2196f3' : '#e53935' }]}>Equipe {player?.team}</Text>
            </View>
            <View style={styles.scoreInfo}>
              <Text style={styles.scoreLabel}>Pontuação Da Equipe:</Text>
              <Text style={styles.score}>{teamScore}</Text>
            </View>
          </View>

          <View style={styles.scannerBox}>
            <CameraView
              ref={ref => setCameraRef(ref)}
              style={StyleSheet.absoluteFillObject}
              facing="back"
              barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
              onBarcodeScanned={scanned || status === 'finished' ? undefined : handleBarCodeScanned}
            />
            <View style={styles.overlay}>
              <View style={styles.scanFrame} />
              <Text style={styles.scanInstruction}>
                {status === 'finished' ? 'A partida foi encerrada!' : scanned ? 'QR Code detectado!' : 'Posicione o QR Code dentro do quadro'}
              </Text>
            </View>
          </View>

          <View style={styles.pointsInfoBottom}>
            <Text style={{ fontWeight: 'bold', marginBottom: 12, fontSize: 18 }}>Sistema de Pontos:</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: 'green', marginRight: 10 }} />
              <Text style={{ fontSize: 16 }}>Verde: 1 ponto</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: 'orange', marginRight: 10 }} />
              <Text style={{ fontSize: 16 }}>Laranja: 3 pontos</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: 'red', marginRight: 10 }} />
              <Text style={{ fontSize: 16 }}>Vermelho: 5 pontos</Text>
            </View>
          </View>
        </>
      )}

      <View style={styles.buttonContainer}>
        {scanned && (
          <Button title="Escanear novamente" onPress={() => setScanned(false)} />
        )}
      </View>

      {/* Modal flutuante quando partida encerrada */}
      {status === 'finished' && (
        <View style={styles.modalOverlay}>
            <View style={{ backgroundColor: '#fff', borderRadius: 24, padding: 32, alignItems: 'center', width: 300, elevation: 6 }}>
                {/* Ícone de relógio animado */}
                <View style={{ marginBottom: 10 }}>
                  <Text style={{ fontSize: 44, textAlign: 'center' }}><MaterialCommunityIcons name="alert-circle" size={45} color="#e53935" /></Text>
                </View>
                <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#d32f2f', marginBottom: 16, textAlign: 'center' }}>
                  PARTIDA ENCERRADA!
                </Text>
                <TouchableOpacity
                  style={{ backgroundColor: '#43a047', borderRadius: 8, paddingVertical: 14, paddingHorizontal: 32, marginTop: 8, elevation: 2 }}
                  onPress={() => navigation.navigate('Results')}
                  activeOpacity={0.85}
                >
                  <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18, letterSpacing: 1 }}>Exibir Resultados</Text>
                </TouchableOpacity>
              </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: isTablet() ? spacing(16) : spacing(16),
    paddingTop: isTablet() ? spacing(16) : spacing(20),
  },
  // Layout para Tablet
  tabletLayout: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing(16),
  },
  leftColumn: {
    flex: 0.85,
    justifyContent: 'flex-start',
    gap: spacing(6),
  },
  rightColumn: {
    flex: 1.15,
    justifyContent: 'center',
  },
  playerInfoCard: {
    backgroundColor: '#fff',
    borderRadius: spacing(10),
    padding: spacing(10),
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  scoreCard: {
    backgroundColor: '#fff',
    borderRadius: spacing(10),
    padding: spacing(10),
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  qrCountCard: {
    backgroundColor: '#fff',
    borderRadius: spacing(10),
    padding: spacing(10),
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  qrCountLabel: {
    fontSize: scale(13),
    color: '#666',
    marginBottom: spacing(2),
  },
  qrCountValue: {
    fontSize: scale(20),
    fontWeight: 'bold',
    color: '#2196f3',
  },
  pointsCard: {
    backgroundColor: '#fff',
    borderRadius: spacing(10),
    padding: spacing(10),
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  pointsTitle: {
    fontSize: scale(13),
    fontWeight: 'bold',
    marginBottom: spacing(6),
    color: '#333',
  },
  pointItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing(4),
  },
  colorDot: {
    width: spacing(12),
    height: spacing(12),
    borderRadius: spacing(6),
    marginRight: spacing(8),
  },
  pointText: {
    fontSize: scale(12),
    color: '#666',
  },
  // Layout para Smartphone
  pointsInfoBottom: {
    position: 'absolute',
    bottom: 32,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    alignSelf: 'center',
  },
  timerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fffbe6',
    borderRadius: spacing(10),
    borderWidth: 2,
    borderColor: '#FFD600',
    paddingVertical: spacing(isTablet() ? 6 : 10),
    paddingHorizontal: spacing(isTablet() ? 14 : 18),
    marginBottom: isTablet() ? 0 : spacing(12),
    alignSelf: 'center',
    elevation: 2,
    shadowColor: '#FFD600',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  timerLabel: {
    fontSize: scale(isTablet() ? 14 : 18),
    fontWeight: 'bold',
    color: '#333',
    marginRight: spacing(8),
  },
  timerValue: {
    fontSize: scale(isTablet() ? 20 : 28),
    fontWeight: 'bold',
    color: '#FFD600',
    letterSpacing: 2,
    backgroundColor: '#fff',
    borderRadius: spacing(8),
    paddingHorizontal: spacing(8),
    paddingVertical: spacing(2),
    borderWidth: 1,
    borderColor: '#FFD600',
  },
  qrCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  playerInfo: {
    alignItems: 'center',
    marginBottom: 8,
  },
  playerName: {
    fontSize: scale(isTablet() ? 15 : 18),
    fontWeight: '600',
    color: '#333',
  },
  teamName: {
    fontSize: scale(isTablet() ? 13 : 16),
    fontWeight: '500',
  },
  scoreInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  scoreLabel: {
    fontSize: scale(isTablet() ? 12 : 16),
    color: '#666',
    marginRight: spacing(8),
  },
  score: {
    fontSize: scale(isTablet() ? 20 : 20),
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  scannerBox: {
    width: '100%',
    height: isTablet() ? '100%' : 360,
    overflow: 'hidden',
    borderRadius: spacing(16),
    marginBottom: isTablet() ? 0 : spacing(16),
    position: 'relative',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: isTablet() ? spacing(220) : spacing(200),
    height: isTablet() ? spacing(220) : spacing(200),
    borderWidth: 3,
    borderColor: '#4CAF50',
    borderRadius: spacing(12),
    backgroundColor: 'transparent',
  },
  scanInstruction: {
    position: 'absolute',
    bottom: spacing(20),
    color: '#fff',
    fontSize: scale(16),
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: spacing(16),
    paddingVertical: spacing(8),
    borderRadius: spacing(8),
  },
  pointsInfo: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  pointsRow: {
    flexDirection: 'column',
    gap: 4,
  },
  pointsItem: {
    fontSize: 14,
    color: '#666',
    textAlign: 'left',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    gap: 12,
    width: '100%',
  },
  finishedBox: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffeaea',
    borderRadius: 12,
    paddingVertical: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e53935',
  },
  finishedIcon: {
    fontSize: 32,
    color: '#e53935',
    marginBottom: 4,
  },
  finishedText: {
    textAlign: 'center',
    color: '#e53935',
    fontWeight: 'bold',
    fontSize: 18,
  },
  cameraBlock: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.85)',
    zIndex: 20,
    borderRadius: 16,
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  modalBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    width: '80%',
    elevation: 8,
  },
});
