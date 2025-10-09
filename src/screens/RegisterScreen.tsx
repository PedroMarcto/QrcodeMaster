import React, { useState } from 'react';
import { BackHandler } from 'react-native';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
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
        <Image 
          source={require('../../assets/splash-icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        {/*<Text style={styles.title}>QrcodeMaster</Text>*/}
        <Text style={styles.subtitle}>Caça ao Tesouro com Tecnologia</Text>
        <Text style={styles.description}>
          Escaneie QR codes pela feira e ganhe pontos para sua equipe!
        </Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Seu Nome</Text>
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
          <Text style={styles.label}>Escolha sua Equipe</Text>
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
                  styles.teamButtonLabel,
                  team === t && styles.teamButtonTextSelected
                ]}>
                  Equipe {t}
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
            Jogar
          </Text>
        </TouchableOpacity>
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
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 20,
    paddingTop: 10,
  },
  header: {
    alignItems: 'center',
    marginTop: 30,
  },
  logo: {
    width: 200,
    height: 200,
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
    marginBottom: 10,
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
    marginBottom: 30,
  },
  teams: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  teamButton: {
    flex: 1,
    height: 70,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  teamBlue: {
    borderColor: '#3498db',
  },
  teamRed: {
    borderColor: '#e74c3c',
  },
  teamButtonSelected: {
    transform: [{ scale: 1.05 }],
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  teamBlueSelected: {
    backgroundColor: '#3498db',
    borderColor: '#2980b9',
  },
  teamRedSelected: {
    backgroundColor: '#e74c3c',
    borderColor: '#c0392b',
  },
  teamButtonLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2c3e50',
    textAlign: 'center',
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
