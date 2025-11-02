import React from 'react';
import { PaperProvider } from 'react-native-paper';
import { AuthProvider } from './src/context/AuthContext';
import { RootNavigation } from './src/navigation/RootNavigation';
// import './i18n';
// import SCDProvider from './src/context/SCDContext';
// import SCDProvider from './context/SCDContext';
import { SCDProvider } from './src/context/SCDProvider';
export default function App() {
  return (
    <PaperProvider>
      <AuthProvider>
        {/* <SCDProvider> */}
          <RootNavigation />
        {/* </SCDProvider> */}
      </AuthProvider>
    </PaperProvider>
  );
}
