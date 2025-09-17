import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { CameraView, CameraType, Camera } from 'expo-camera';
import { useGame } from '../context/GameContext';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

const colorPoints = {
  verde: 1,
  laranja: 3,
  vermelho: 5,
};

const GAME_QR_PREFIX = 'GameQrcodeFach:';
const validQRCodes = [
  `${GAME_QR_PREFIX}verde`,
  `${GAME_QR_PREFIX}laranja`,
  `${GAME_QR_PREFIX}vermelho`,
];

type Props = NativeStackScreenProps<RootStackParamList, 'Game'>;

export default function GameScreen({ navigation }: Props) {
  const { setResults, results, totalScore, player, timeRemaining, status } = useGame();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [cameraRef, setCameraRef] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);

    if (!validQRCodes.includes(data)) {
      Alert.alert(
        'QR Code inválido',
        'Este QR Code não faz parte do jogo GameQrcodeFach.\n\nProcure pelos QR codes oficiais do evento!',
        [{ text: 'OK', onPress: () => setScanned(false) }]
      );
      return;
    }

    const color = data.replace(GAME_QR_PREFIX, '') as 'verde' | 'laranja' | 'vermelho';
    const alreadyScanned = results.some(result => result.color === color);
    if (alreadyScanned) {
      Alert.alert(
        'QR Code já escaneado!',
        `Você já escaneou o QR Code ${color.toUpperCase()}.\n\nProcure por outros QR codes para ganhar mais pontos!`,
        [{ text: 'OK', onPress: () => setScanned(false) }]
      );
      return;
    }

    const points = colorPoints[color] || 0;
    const newResult = { color, points, date: new Date().toISOString() };
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
      <View style={styles.header}>
        <Text style={styles.title}>Escaneie o QR Code</Text>
        <Text style={styles.timer}>Tempo Restante: {Math.floor(timeRemaining / 60)}:{String(timeRemaining % 60).padStart(2, '0')}</Text>
        <Text style={styles.qrCount}>QR Codes Escaneados: {results.length} / 3</Text>
        <View style={styles.playerInfo}>
          <Text style={styles.playerName}>{player?.name}</Text>
          <Text style={[styles.teamName, { color: player?.team === 'Azul' ? '#2196f3' : '#e53935' }]}>Equipe {player?.team}</Text>
        </View>
        <View style={styles.scoreInfo}>
          <Text style={styles.scoreLabel}>Pontuação:</Text>
          <Text style={styles.score}>{totalScore}</Text>
        </View>
      </View>

      <View style={styles.scannerBox}>
        <CameraView
          ref={ref => setCameraRef(ref)}
          style={StyleSheet.absoluteFillObject}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        />
        <View style={styles.overlay}>
          <View style={styles.scanFrame} />
          <Text style={styles.scanInstruction}>
            {scanned ? 'QR Code detectado!' : 'Posicione o QR Code dentro do quadro'}
          </Text>
        </View>
      </View>

      <View style={styles.pointsInfo}>
        <Text style={styles.pointsTitle}>Sistema de Pontos:</Text>
        <View style={styles.pointsRow}>
          <Text style={styles.pointsItem}>🟢 Verde: 1 ponto</Text>
          <Text style={styles.pointsItem}>🟠 Laranja: 3 pontos</Text>
          <Text style={styles.pointsItem}>🔴 Vermelho: 5 pontos</Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        {scanned && (
          <Button title="Escanear novamente" onPress={() => setScanned(false)} />
        )}
        {status === 'finished' && (
          <Button
            title="Ver Resultados"
            onPress={() => navigation.navigate('Results')}
            color="#4CAF50"
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  timer: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  qrCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
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
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  teamName: {
    fontSize: 16,
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
    fontSize: 16,
    color: '#666',
    marginRight: 8,
  },
  score: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  scannerBox: {
    width: '100%',
    height: 300,
    overflow: 'hidden',
    borderRadius: 16,
    marginBottom: 16,
    position: 'relative',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 200,
    height: 200,
    borderWidth: 3,
    borderColor: '#4CAF50',
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  scanInstruction: {
    position: 'absolute',
    bottom: 20,
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
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
  pointsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
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
});
