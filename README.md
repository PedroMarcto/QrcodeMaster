# QrcodeMaster (GameQrCodeMobile)

Aplicativo mobile para gerenciamento de jogos utilizando QR Code. Permite cadastro de jogadores, criação de salas de espera, registro de resultados e integração com Firebase.

## Funcionalidades
- Cadastro de jogadores
- Criação e gerenciamento de salas de espera
- Registro de resultados dos jogos
- Geração e leitura de QR Codes
- Navegação entre telas
- Integração com Firebase

## Estrutura do Projeto
```
app.json
App.tsx
index.ts
package.json
tsconfig.json
assets/
  adaptive-icon.png
  favicon.png
  icon.png
  splash-icon.png
src/
  config/
    firebase.ts
  context/
    GameContext.tsx
  navigation/
    AppNavigator.tsx
  screens/
    GameScreen.tsx
    RegisterScreen.tsx
    ResultsScreen.tsx
    WaitingRoomScreen.tsx
```

## Tecnologias Utilizadas
- React Native
- TypeScript
- Expo
- Firebase