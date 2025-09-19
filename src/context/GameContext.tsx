import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../config/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

export type Team = 'Azul' | 'Vermelha';

export type Player = {
  name: string;
  team: Team;
  score: number;
};

export type QRResult = {
  color: 'verde' | 'laranja' | 'vermelho';
  points: number;
  date: string;
  id: string; // uuid do QR Code
  team: string; // equipe que escaneou
};

export type GameState = {
  player: Player | null;
  setPlayer: (player: Player | null) => void;
  results: QRResult[];
  setResults: (results: QRResult[]) => void;
  status: 'waiting' | 'active' | 'finished';
  timeRemaining: number;
  teams: {
    blue: { players: string[]; score: number };
    red: { players: string[]; score: number };
  };
  scannedQRCodes: string[];
  clearData: () => void;
  totalScore: number;
};

const GameContext = createContext<GameState | undefined>(undefined);

const STORAGE_KEYS = {
  PLAYER: '@game_player',
  RESULTS: '@game_results',
  GAME_STARTED: '@game_started',
};

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [player, setPlayerState] = useState<Player | null>(null);
  const [results, setResultsState] = useState<QRResult[]>([]);
  const [status, setStatus] = useState<'waiting' | 'active' | 'finished'>('waiting');
  const [timeRemaining, setTimeRemaining] = useState<number>(600);
  const [teams, setTeams] = useState<{ blue: { players: string[]; score: number }; red: { players: string[]; score: number } }>({ blue: { players: [], score: 0 }, red: { players: [], score: 0 } });
  const [scannedQRCodes, setScannedQRCodes] = useState<string[]>([]);




  // Carregar dados do Firestore e escutar atualizações em tempo real
  useEffect(() => {
    const gameDocRef = doc(db, 'game', 'current');
    const unsubscribe = onSnapshot(gameDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        // Atualiza contexto local com dados do Firestore
        if (data.player) setPlayerState(data.player);
        if (data.results) setResultsState(data.results);
        if (data.status) setStatus(data.status);
        if (typeof data.timeRemaining === 'number') setTimeRemaining(data.timeRemaining);
        if (data.teams) {
          setTeams({
            blue: {
              players: Array.isArray(data.teams?.blue?.players) ? data.teams.blue.players : [],
              score: typeof data.teams?.blue?.score === 'number' ? data.teams.blue.score : 0
            },
            red: {
              players: Array.isArray(data.teams?.red?.players) ? data.teams.red.players : [],
              score: typeof data.teams?.red?.score === 'number' ? data.teams.red.score : 0
            }
          });
        }
      }
    });
    // Carrega dados locais para fallback/offline
    loadData();
    return () => unsubscribe();
  }, []);

  const loadData = async () => {
    try {
      const [playerData, resultsData, gameStartedData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.PLAYER),
        AsyncStorage.getItem(STORAGE_KEYS.RESULTS),
        AsyncStorage.getItem(STORAGE_KEYS.GAME_STARTED),
      ]);

      if (playerData) setPlayerState(JSON.parse(playerData));
      if (resultsData) setResultsState(JSON.parse(resultsData));
  // Removido: gameStarted agora é status
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const setPlayer = async (newPlayer: Player | null) => {
    try {
      setPlayerState(newPlayer);
      // Salva no Firestore no campo correto de teams
      const gameDocRef = doc(db, 'game', 'current');
      if (newPlayer) {
        // Buscar o documento atual para não sobrescrever outros jogadores
        const { getDoc } = await import('firebase/firestore');
        const docSnap = await getDoc(gameDocRef);
        let teamsData = { blue: { players: [] as string[], score: 0 }, red: { players: [] as string[], score: 0 } };
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.teams) {
            teamsData = {
              blue: { players: Array.isArray(data.teams.blue?.players) ? data.teams.blue.players as string[] : [], score: data.teams.blue?.score || 0 },
              red: { players: Array.isArray(data.teams.red?.players) ? data.teams.red.players as string[] : [], score: data.teams.red?.score || 0 }
            };
          }
        }
        // Adiciona o jogador na equipe correta se não estiver presente
        const teamKey = newPlayer.team === 'Azul' ? 'blue' : 'red';
        if (!teamsData[teamKey].players.includes(newPlayer.name)) {
          teamsData[teamKey].players.push(newPlayer.name);
        }
        await setDoc(gameDocRef, { teams: teamsData }, { merge: true });
        await AsyncStorage.setItem(STORAGE_KEYS.PLAYER, JSON.stringify(newPlayer));
      } else {
        await AsyncStorage.removeItem(STORAGE_KEYS.PLAYER);
      }
    } catch (error) {
      console.error('Erro ao salvar jogador:', error);
    }
  };

  const setResults = async (newResults: QRResult[]) => {
    try {
      setResultsState(newResults);
      // Salva no Firestore
      const gameDocRef = doc(db, 'game', 'current');
      // Extrai os ids dos QR Codes escaneados
      const scannedIds = newResults.map(result => result.id);

      // Calcular pontuação da equipe do jogador
  const teamKey: 'blue' | 'red' = player?.team === 'Azul' ? 'blue' : 'red';
      // Filtra só os QR Codes do jogador atual (se necessário)
      const teamResults = newResults; // Se quiser filtrar por jogador, ajuste aqui
      const teamScore = teamResults.reduce((sum, result) => sum + result.points, 0);

      // Atualiza o score da equipe no Firestore
      await setDoc(gameDocRef, {
        results: newResults,
        scannedQRCodes: scannedIds,
        teams: {
          [teamKey]: {
            // Mantém os jogadores e atualiza o score
            players: teams[teamKey]?.players || [],
            score: teamScore
          },
          // Mantém a outra equipe sem alteração
          [teamKey === 'blue' ? 'red' : 'blue']: teams[teamKey === 'blue' ? 'red' : 'blue']
        }
      }, { merge: true });

      // Salva local
      await AsyncStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(newResults));
    } catch (error) {
      console.error('Erro ao salvar resultados:', error);
    }
  };

  const setGameStarted = async (started: boolean) => {
    try {
  // Removido: função de iniciar jogo pelo app não existe mais
    } catch (error) {
      console.error('Erro ao salvar status do jogo:', error);
    }
  };

  const clearData = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.PLAYER),
        AsyncStorage.removeItem(STORAGE_KEYS.RESULTS),
        AsyncStorage.removeItem(STORAGE_KEYS.GAME_STARTED),
      ]);
      setPlayerState(null);
      setResultsState([]);
  setStatus('waiting');
      // Limpa no Firestore
      const gameDocRef = doc(db, 'game', 'current');
      await setDoc(gameDocRef, {
        player: null,
        results: [],
        gameStarted: false
      }, { merge: true });
    } catch (error) {
      console.error('Erro ao limpar dados:', error);
    }
  };

  const totalScore = results.reduce((sum, result) => sum + result.points, 0);

  return (
    <GameContext.Provider
      value={{
        player,
        setPlayer,
        results,
        setResults,
        status,
        timeRemaining,
        teams,
        scannedQRCodes,
        clearData,
        totalScore
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame deve ser usado dentro de um GameProvider');
  return context;
};
