// src/App.jsx
// Ponto de entrada modular e principal do JSM Transporte (LogiTrack SP)

import React, { useEffect, useState } from 'react';
import { auth, db } from './services/firebase';
import {
  onAuthStateChanged,
  signInAnonymously,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { collection, doc, onSnapshot } from 'firebase/firestore';

import { LoginView } from './pages/LoginView';
import { DriverView } from './pages/DriverView';
import { AdminView } from './pages/AdminView';
import { Toast } from './components/common/Toast';

const getTodayDateString = () => {
  return new Date().toLocaleDateString('pt-BR');
};

export default function App() {
  // Estado de Autenticação e Usuário
  const [currentUser, setCurrentUser] = useState(null);
  const [loginError, setLoginError] = useState('');

  // Notificações Toast
  const [toast, setToast] = useState(null);

  // Data atual sincronizada
  const [todayDate, setTodayDate] = useState(getTodayDateString());

  // Estados em Tempo Real do Firebase
  const [fbMotoristas, setFbMotoristas] = useState([]);
  const [fbVeiculos, setFbVeiculos] = useState([]);
  const [fbViagens, setFbViagens] = useState([]);
  const [fbDespesas, setFbDespesas] = useState([]);
  const [fbOcorrencias, setFbOcorrencias] = useState([]);
  const [metasConfig, setMetasConfig] = useState({
    metaFaturamentoMes: 120000,
    metaFaturamentoAno: 1500000,
    metaViagensMes: 180,
    metaConsumoKmL: 10.0,
    diasUteisMes: 26,
    percentualExpansao: 20
  });
  const [despesasFixasConfig, setDespesasFixasConfig] = useState({
    prestacaoFurgao: 7000,
    seguroMaster: 680,
    rastreamento: 70,
    ipva: 550,
    salarioMotorista: 3500,
    salarioAjudante: 1800,
    impostos: 850,
    dieselAjusteManual: 0,
    usarDieselManual: false
  });
  const [totalSystemRevenue, setTotalSystemRevenue] = useState(0);
  const [usedRomaneioRecords, setUsedRomaneioRecords] = useState([]);

  // Sincronização periódica da data do sistema
  useEffect(() => {
    const syncDate = () => setTodayDate(getTodayDateString());
    syncDate();
    const interval = setInterval(syncDate, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fechamento automático do Toast após 4 segundos
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Conexão em Tempo Real com o Firebase
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        signInAnonymously(auth).catch((err) => {
          console.warn('Conexão anônima em segundo plano:', err.message);
        });
      }
    });

    // Listener de Motoristas
    const unsubMotoristas = onSnapshot(
      collection(db, 'motoristas'),
      (snap) => {
        const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setFbMotoristas(docs);
      },
      (err) => console.error('Erro ao escutar motoristas:', err)
    );

    // Listener de Veículos
    const unsubVeiculos = onSnapshot(
      collection(db, 'veiculos'),
      (snap) => {
        const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setFbVeiculos(docs);
      },
      (err) => console.error('Erro ao escutar veículos:', err)
    );

    // Listener de Despesas
    const unsubDespesas = onSnapshot(
      collection(db, 'despesas'),
      (snap) => {
        const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setFbDespesas(docs);
      },
      (err) => console.error('Erro ao escutar despesas:', err)
    );

    // Listener de Ocorrências
    const unsubOcorrencias = onSnapshot(
      collection(db, 'ocorrencias'),
      (snap) => {
        const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setFbOcorrencias(docs);
      },
      (err) => console.error('Erro ao escutar ocorrências:', err)
    );

    // Listener de Viagens
    const unsubViagens = onSnapshot(
      collection(db, 'viagens'),
      (snap) => {
        const trips = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setFbViagens(trips);

        // Preencher romaneios já validados para evitar duplicidade
        setUsedRomaneioRecords((prev) => {
          const merged = [...prev];
          trips.forEach((trip) => {
            if (trip.romaneioId && trip.romaneioDataDocumento) {
              const existe = merged.some(
                (item) =>
                  item.id === String(trip.romaneioId) &&
                  item.dataDocumento === String(trip.romaneioDataDocumento)
              );
              if (!existe) {
                merged.push({
                  id: String(trip.romaneioId),
                  dataDocumento: String(trip.romaneioDataDocumento)
                });
              }
            }
          });
          return merged;
        });

        // Calcular faturamento total
        const receita = trips.reduce(
          (total, trip) => total + (Number(trip.valor) || 0),
          0
        );
        setTotalSystemRevenue(receita);
      },
      (err) => console.error('Erro ao escutar viagens:', err)
    );

    // Listener de Configurações de Metas
    const unsubMetas = onSnapshot(
      doc(db, 'configuracoes', 'metas'),
      (snap) => {
        if (snap.exists()) {
          setMetasConfig((prev) => ({ ...prev, ...snap.data() }));
        }
      },
      (err) => console.warn('Metas padrão em uso:', err)
    );

    // Listener de Despesas Fixas e Obrigações
    const unsubDespesasFixas = onSnapshot(
      doc(db, 'configuracoes', 'despesasFixas'),
      (snap) => {
        if (snap.exists()) {
          setDespesasFixasConfig((prev) => ({ ...prev, ...snap.data() }));
        }
      },
      (err) => console.warn('Despesas fixas padrão em uso:', err)
    );

    return () => {
      unsubAuth();
      unsubMotoristas();
      unsubVeiculos();
      unsubDespesas();
      unsubOcorrencias();
      unsubViagens();
      unsubMetas();
      unsubDespesasFixas();
    };
  }, []);

  // Manipulação de Login
  const handleLogin = async (dadosLogin) => {
    setLoginError('');

    if (dadosLogin.role === 'admin') {
      const email = dadosLogin.email;
      const pass = dadosLogin.password;

      if (!email || !pass) {
        setLoginError('Informe o e-mail e a senha do gestor.');
        return;
      }

      try {
        await signInWithEmailAndPassword(auth, email, pass);
        setCurrentUser({
          name: 'Gestão Geral',
          role: 'admin',
          id: 'ADM-01'
        });
        setToast({
          type: 'success',
          title: 'Acesso Autorizado',
          desc: 'Bem-vindo ao Painel Administrativo JSM.'
        });
      } catch (err) {
        console.error('Erro no login administrativo:', err);
        setLoginError('E-mail ou senha inválidos.');
      }
      return;
    }

    // Login do Motorista
    if (!dadosLogin.name || !dadosLogin.driverId || !dadosLogin.password) {
      setLoginError('Preencha o nome, placa e senha do motorista.');
      return;
    }

    setCurrentUser({
      name: dadosLogin.name,
      role: 'driver',
      driverId: dadosLogin.driverId
    });

    setToast({
      type: 'success',
      title: `Olá, ${dadosLogin.name}!`,
      desc: `Veículo ${dadosLogin.driverId} pronto para a jornada de hoje.`
    });
  };

  // Manipulação de Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Erro no logout do Firebase:', e);
    }
    setCurrentUser(null);
    setToast({
      type: 'info',
      title: 'Sessão Encerrada',
      desc: 'Você saiu do sistema com segurança.'
    });
  };

  // 1. TELA DE LOGIN
  if (!currentUser) {
    return (
      <>
        <Toast toast={toast} onClose={() => setToast(null)} />
        <LoginView
          onLogin={handleLogin}
          loginError={loginError}
          onClearError={() => setLoginError('')}
        />
      </>
    );
  }

  // 2. PAINEL DO MOTORISTA
  if (currentUser.role === 'driver') {
    return (
      <>
        <Toast toast={toast} onClose={() => setToast(null)} />
        <DriverView
          currentUser={currentUser}
          todayDate={todayDate}
          fbViagens={fbViagens}
          fbDespesas={fbDespesas}
          usedRomaneioRecords={usedRomaneioRecords}
          setUsedRomaneioRecords={setUsedRomaneioRecords}
          onLogout={handleLogout}
          onShowToast={(t) => setToast(t)}
        />
      </>
    );
  }

  // 3. PAINEL ADMINISTRATIVO
  return (
    <>
      <Toast toast={toast} onClose={() => setToast(null)} />
      <AdminView
        currentUser={currentUser}
        totalRevenue={totalSystemRevenue}
        fbViagens={fbViagens}
        fbDespesas={fbDespesas}
        fbVeiculos={fbVeiculos}
        fbMotoristas={fbMotoristas}
        fbOcorrencias={fbOcorrencias}
        metasConfig={metasConfig}
        despesasFixasConfig={despesasFixasConfig}
        onLogout={handleLogout}
        onShowToast={(t) => setToast(t)}
      />
    </>
  );
}
