import React, { useState } from 'react';
import { BackHandler } from 'react-native';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useGame } from '../context/GameContext';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

const teams = ['Azul', 'Vermelha'] as const;

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

export default function RegisterScreen({ navigation }: Props) {
  React.useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);
  const [name, setName] = useState('');
  const [team, setTeam] = useState<typeof teams[number] | null>(null);
  const { setPlayer } = useGame();

    React.useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => backHandler.remove();
  }, []);

  const handleRegister = () => {
    if (!name.trim()) {
      Alert.alert('Nome obrigatório', 'Por favor, digite seu nome para continuar.');
      return;
    }
    if (!team) {
      Alert.alert('Equipe obrigatória', 'Por favor, escolha uma equipe para continuar.');
      return;
    }
    setPlayer({ name: name.trim(), team, score: 0 });
    navigation.navigate('WaitingRoom');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🎯 QrMaster</Text>
        <Text style={styles.subtitle}>Caça ao Tesouro QR</Text>
        <Text style={styles.description}>
          Escaneie QR codes pela feira e ganhe pontos para sua equipe!
        </Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>👤 Seu Nome</Text>
          <TextInput
            style={[styles.input, name.trim() ? styles.inputFilled : null]}
            placeholder="Digite seu nome aqui"
            placeholderTextColor="#999"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            maxLength={20}
          />
        </View>

        <View style={styles.teamContainer}>
          <Text style={styles.label}>🏆 Escolha sua Equipe</Text>
          <View style={styles.teams}>
            {teams.map((t) => (
              <TouchableOpacity
                key={t}
                style={[
                  styles.teamButton,
                  team === t && styles.teamButtonSelected,
                  t === 'Azul' ? styles.teamBlue : styles.teamRed,
                  team === t && (t === 'Azul' ? styles.teamBlueSelected : styles.teamRedSelected)
                ]}
                onPress={() => setTeam(t)}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.teamButtonText,
                  team === t && styles.teamButtonTextSelected
                ]}>
                  {t === 'Azul' ? '🔵' : '🔴'} Equipe {t}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.enterButton,
            (!name.trim() || !team) && styles.enterButtonDisabled
          ]}
          onPress={handleRegister}
          disabled={!name.trim() || !team}
          activeOpacity={0.8}
        >
          <Text style={[
            styles.enterButtonText,
            (!name.trim() || !team) && styles.enterButtonTextDisabled
          ]}>
            🚀 Entrar no Jogo
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          💡 Dica: Procure por QR codes verdes (1pt), laranjas (3pts) e vermelhos (5pts)
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 20,
    paddingTop: 40,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    color: '#34495e',
    fontWeight: '600',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  form: {
    flex: 1,
    justifyContent: 'center',
  },
  inputContainer: {
    marginBottom: 30,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  input: {
    height: 56,
    borderColor: '#ddd',
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    fontSize: 18,
    color: '#2c3e50',
  },
  inputFilled: {
    borderColor: '#27ae60',
    backgroundColor: '#f8fff8',
  },
  teamContainer: {
    marginBottom: 40,
  },
  teams: {
    gap: 16,
  },
  teamButton: {
    height: 64,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    backgroundColor: '#fff',
  },
  teamBlue: {
    borderColor: '#3498db',
  },
  teamRed: {
    borderColor: '#e74c3c',
  },
  teamButtonSelected: {
    transform: [{ scale: 1.02 }],
  },
  teamBlueSelected: {
    backgroundColor: '#3498db',
    borderColor: '#2980b9',
  },
  teamRedSelected: {
    backgroundColor: '#e74c3c',
    borderColor: '#c0392b',
  },
  teamButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
  },
  teamButtonTextSelected: {
    color: '#fff',
  },
  enterButton: {
    height: 56,
    backgroundColor: '#27ae60',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#27ae60',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  enterButtonDisabled: {
    backgroundColor: '#bdc3c7',
    shadowOpacity: 0,
    elevation: 0,
  },
  enterButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  enterButtonTextDisabled: {
    color: '#7f8c8d',
  },
  footer: {
    marginTop: 20,
    paddingHorizontal: 10,
  },
  footerText: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 20,
  },
});
