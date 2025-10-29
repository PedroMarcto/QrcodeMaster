import React, { useState } from 'react';
import { BackHandler, Dimensions, Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView, Platform } from 'react-native';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { useGame } from '../context/GameContext';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { isTablet, scale, spacing, imageSize, getMaxWidth } from '../utils/responsive';
import { MaterialCommunityIcons } from '@expo/vector-icons';

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
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
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
              <Text style={styles.subtitle}>Caça ao Tesouro com Tecnologia</Text>
              <Text style={styles.description}>
                Escaneie QR codes pela feira e ganhe pontos para sua equipe!
              </Text>
            </View>

            <View style={styles.rightColumn}>
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
          </View>
        ) : (
          // Layout para Smartphone (1 coluna)
          <>
            <View style={styles.header}>
              <Image 
                source={require('../../assets/splash-icon.png')}
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={styles.subtitle}>Caça ao Tesouro com Tecnologia</Text>
              <Text style={styles.description}>
                Escaneie QR codes pela feira e ganhe pontos para sua equipe!
              </Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}><MaterialCommunityIcons name="account" size={20} color="#2c3e50" />Seu Nome</Text>
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
                        <MaterialCommunityIcons
                          name="flag-variant"
                          size={38}
                          color={t === 'Azul' ? (team === t ? '#fff' : '#2196f3') : (team === t ? '#fff' : '#e74c3c')}
                        />
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
          </>
        )}
      </View>

        <View style={styles.footer}>
          <Text style={styles.footerTitle}>QrcodeMaster Beta</Text>
          <Text style={styles.footerSubtitle}>Desenvolvido para Fatech 2025</Text>
          <Text style={styles.footerAuthor}>
            Copyright 2025 Pedro Otávio Rodrigues Marcato
          </Text>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  contentWrapper: {
    flex: 1,
    width: '100%',
    maxWidth: isTablet() ? 900 : getMaxWidth(),
    alignSelf: 'center',
    paddingHorizontal: spacing(20),
    paddingTop: isTablet() ? spacing(30) : spacing(20),
    paddingBottom: spacing(120), // Mais espaço para o footer
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
  header: {
    alignItems: 'center',
    marginTop: spacing(20),
    marginBottom: spacing(10),
  },
  logo: {
    width: isTablet() ? imageSize(180) : imageSize(180),
    height: isTablet() ? imageSize(180) : imageSize(180),
    marginBottom: isTablet() ? spacing(12) : spacing(10),
  },
  title: {
    fontSize: scale(32),
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: spacing(8),
    textAlign: 'center',
  },
  subtitle: {
    fontSize: isTablet() ? scale(18) : scale(18),
    color: '#34495e',
    fontWeight: '600',
    marginBottom: spacing(6),
    textAlign: 'center',
  },
  description: {
    fontSize: isTablet() ? scale(14) : scale(14),
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: isTablet() ? scale(20) : scale(20),
    paddingHorizontal: spacing(10),
  },
  form: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: spacing(10),
  },
  inputContainer: {
    marginBottom: spacing(12),
  },
  label: {
    fontSize: isTablet() ? scale(16) : scale(16),
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: spacing(6),
  },
  input: {
    height: isTablet() ? spacing(50) : spacing(50),
    borderColor: '#ddd',
    borderWidth: 2,
    borderRadius: spacing(12),
    paddingHorizontal: spacing(16),
    backgroundColor: '#fff',
    fontSize: isTablet() ? scale(16) : scale(16),
    color: '#2c3e50',
  },
  inputFilled: {
    borderColor: '#27ae60',
    backgroundColor: '#f8fff8',
  },
  teamContainer: {
    marginBottom: spacing(15),
  },
  teams: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing(8),
  },
  teamButton: {
    flex: 1,
    minWidth: 0,
    height: isTablet() ? spacing(55) : spacing(60),
    borderRadius: spacing(12),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    // Removido marginHorizontal para evitar diferença de largura
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
    fontSize: isTablet() ? scale(16) : scale(16),
    fontWeight: '700',
    color: '#2c3e50',
    textAlign: 'center',
  },
  teamButtonTextSelected: {
    color: '#fff',
  },
  enterButton: {
    height: isTablet() ? spacing(50) : spacing(50),
    backgroundColor: '#27ae60',
    borderRadius: spacing(12),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#27ae60',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    marginTop: spacing(8),
  },
  enterButtonDisabled: {
    backgroundColor: '#bdc3c7',
    shadowOpacity: 0,
    elevation: 0,
  },
  enterButtonText: {
    fontSize: isTablet() ? scale(18) : scale(18),
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
