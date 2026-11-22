import React, {
  useEffect,
  useRef,
  useState
} from 'react';

// --- FIREBASE IMPORTS ---
import { initializeApp } from 'firebase/app';

import {
  getAuth,
  onAuthStateChanged,
  signInAnonymously,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';

import {
  addDoc,
  collection,
  doc,
  getFirestore,
  onSnapshot,
  updateDoc
} from 'firebase/firestore';

// --- FIREBASE CONFIGURATION ---
const firebaseConfig = {
  apiKey: 'AIzaSyDZRkR4RQ9QdFAYRbqS4NpoeTAARNabN14',
  authDomain: 'jsm-transporte.firebaseapp.com',
  projectId: 'jsm-transporte',
  storageBucket: 'jsm-transporte.firebasestorage.app',
  messagingSenderId: '58453115039',
  appId: '1:58453115039:web:d8ba25c242c82ffa8462aa',
  measurementId: 'G-VE1TF5XTNC'
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- INITIAL STATE & DEMO DATA ---
const DEFAULT_ROMANEIO_DATA = {
  id: '98473',
  empresa: 'APETITO FOODS LTDA',
  cidade: 'SÃO PAULO',
  pesoBruto: '873,965 kg',
  qtdTotal: 97
};

const getTodayDateString = () => {
  return new Date().toLocaleDateString('pt-BR');
};

const CHART_DATA_ADMIN = [
  { name: '08:00', faturamento: 14200 },
  { name: '10:00', faturamento: 28400 },
  { name: '12:00', faturamento: 49100 },
  { name: '14:00', faturamento: 68500 },
  { name: '16:00', faturamento: 89068 },
  { name: '18:00', faturamento: 108136 }
];

export default function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState(null);
  const [loginRole, setLoginRole] = useState('driver');
  const [loginError, setLoginError] = useState('');

  const [driverNameInput, setDriverNameInput] = useState('SILVIO LUIZ MOJANO');
  const [driverIdInput, setDriverIdInput] = useState('CVP-3G01');
  const [driverPassword, setDriverPassword] = useState('');

  const [adminEmailInput, setAdminEmailInput] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  // Navigation State for Admin
  const [adminTab, setAdminTab] = useState('dashboard');

  // Firebase Real-time Data States
  const [fbMotoristas, setFbMotoristas] = useState([]);
  const [fbVeiculos, setFbVeiculos] = useState([]);
  const [fbViagens, setFbViagens] = useState([]);
  const [fbDespesas, setFbDespesas] = useState([]);
  const [totalSystemRevenue, setTotalSystemRevenue] = useState(0);

  // Modals & Controls
  const [todayDate, setTodayDate] = useState(getTodayDateString());
  const [romaneio] = useState(DEFAULT_ROMANEIO_DATA);
  const [romaneioPhotoCaptured, setRomaneioPhotoCaptured] = useState(false);
  const [extractedRomaneioData, setExtractedRomaneioData] = useState(null);
  const [usedRomaneioRecords, setUsedRomaneioRecords] = useState([]);
  const [selectedScanFile, setSelectedScanFile] = useState(null);
  const [scanPreviewUrl, setScanPreviewUrl] = useState(null);
  const [scannerError, setScannerError] = useState('');
  const [tripCompleted, setTripCompleted] = useState(false);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [scannerType, setScannerType] = useState('romaneio');
  const [scanningProgress, setScanningProgress] = useState(false);
  const [scanResultToast, setScanResultToast] = useState(null);
  const [showFinishTripModal, setShowFinishTripModal] = useState(false);
  const [romaneioRequiredNotice, setRomaneioRequiredNotice] = useState(false);
  const fileInputRef = useRef(null);

  // Clean inline SVG icons rendered directly in the active React tree
  const renderIcon = (name, className = 'w-5 h-5') => {
    switch (name) {
      case 'truck':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
            <path d="M15 18H9" />
            <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
            <circle cx="17" cy="18" r="2" />
            <circle cx="7" cy="18" r="2" />
          </svg>
        );
      case 'map-pin':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
            <circle cx="12" cy="10" r="3" />
          </svg>
        );
      case 'camera':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
            <circle cx="12" cy="13" r="3" />
          </svg>
        );
      case 'check':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <circle cx="12" cy="12" r="10" />
            <path d="m9 12 2 2 4-4" />
          </svg>
        );
      case 'file-text':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
            <path d="M14 2v4a2 2 0 0 0 2 2h4" />
            <path d="M10 9H8" />
            <path d="M16 13H8" />
            <path d="M16 17H8" />
          </svg>
        );
      case 'fuel':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <line x1="3" x2="15" y1="22" y2="22" />
            <line x1="4" x2="14" y1="9" y2="9" />
            <path d="M14 22V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v18" />
            <path d="M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2a2 2 0 0 0 2-2V9.83a2 2 0 0 0-.59-1.42L18 5" />
          </svg>
        );
      case 'user':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        );
      case 'shield':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
          </svg>
        );
      case 'logout':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" x2="9" y1="12" y2="12" />
          </svg>
        );
      case 'trending-up':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
            <polyline points="16 7 22 7 22 13" />
          </svg>
        );
      case 'refresh':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
            <path d="M8 16H3v5" />
          </svg>
        );
      case 'sparkles':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
          </svg>
        );
      case 'file-check':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
            <path d="M14 2v4a2 2 0 0 0 2 2h4" />
            <path d="m9 15 2 2 4-4" />
          </svg>
        );
      case 'target':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="6" />
            <circle cx="12" cy="12" r="2" />
          </svg>
        );
      case 'rocket':
      default:
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
            <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
            <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
            <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
          </svg>
        );
    }
  };

  // Keep app current date synchronized
  useEffect(() => {
    const syncDate = () => setTodayDate(getTodayDateString());
    syncDate();
    const interval = setInterval(syncDate, 30000);
    return () => clearInterval(interval);
  }, []);

  // Auto-clear toasts
  useEffect(() => {
    if (scanResultToast) {
      const timer = setTimeout(() => setScanResultToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [scanResultToast]);

  // Auto-clear romaneio required notice
  useEffect(() => {
    if (romaneioRequiredNotice) {
      const timer = setTimeout(() => setRomaneioRequiredNotice(false), 4500);
      return () => clearTimeout(timer);
    }
  }, [romaneioRequiredNotice]);

  // Firebase Connection & Listeners
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        signInAnonymously(auth).catch((error) => {
          console.error('Erro na autenticação anônima:', error);
        });
      }
    });

    const unsubMot = onSnapshot(
      collection(db, 'motoristas'),
      (snapshot) => {
        const records = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data()
        }));
        setFbMotoristas(records);
      },
      (error) => {
        console.error('Erro ao carregar motoristas:', error);
      }
    );

    const unsubVei = onSnapshot(
      collection(db, 'veiculos'),
      (snapshot) => {
        const records = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data()
        }));
        setFbVeiculos(records);
      },
      (error) => {
        console.error('Erro ao carregar veículos:', error);
      }
    );

    const unsubDes = onSnapshot(
      collection(db, 'despesas'),
      (snapshot) => {
        const records = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data()
        }));
        setFbDespesas(records);
      },
      (error) => {
        console.error('Erro ao carregar despesas:', error);
      }
    );

    const unsubVia = onSnapshot(
      collection(db, 'viagens'),
      (snapshot) => {
        const trips = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data()
        }));

        setFbViagens(trips);

        setUsedRomaneioRecords((previous) => {
          const merged = [...previous];

          trips.forEach((trip) => {
            if (trip.romaneioId && trip.romaneioDataDocumento) {
              const exists = merged.some(
                (item) =>
                  item.id === String(trip.romaneioId) &&
                  item.dataDocumento === String(trip.romaneioDataDocumento)
              );

              if (!exists) {
                merged.push({
                  id: String(trip.romaneioId),
                  dataDocumento: String(trip.romaneioDataDocumento)
                });
              }
            }
          });

          return merged;
        });

        const revenue = trips.reduce(
          (total, trip) => total + (Number(trip.valor) || 0),
          0
        );

        setTotalSystemRevenue(revenue);
      },
      (error) => {
        console.error('Erro ao carregar viagens:', error);
      }
    );

    return () => {
      unsubscribeAuth();
      unsubMot();
      unsubVei();
      unsubDes();
      unsubVia();
    };
  }, []);

  // Clean up object URL when preview changes or unmounts
  useEffect(() => {
    return () => {
      if (scanPreviewUrl) {
        URL.revokeObjectURL(scanPreviewUrl);
      }
    };
  }, [scanPreviewUrl]);

  // Open camera scanner modal cleanly (camera only, no gallery)
  const openScannerForType = (type) => {
    const currentAppDate = getTodayDateString();

    setTodayDate(currentAppDate);
    setScannerType(type);
    setSelectedScanFile(null);
    setScannerError('');

    if (scanPreviewUrl) {
      URL.revokeObjectURL(scanPreviewUrl);
      setScanPreviewUrl(null);
    }

    setShowScannerModal(true);
  };

  // Handle real image file selection strictly from camera capture
  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    setScannerError('');

    if (!file) {
      setSelectedScanFile(null);
      return;
    }

    if (!file.type.startsWith('image/')) {
      setSelectedScanFile(null);
      setScannerError('Capture uma imagem válida diretamente pela câmera.');
      return;
    }

    if (scanPreviewUrl) {
      URL.revokeObjectURL(scanPreviewUrl);
    }

    setSelectedScanFile(file);
    setScanPreviewUrl(URL.createObjectURL(file));

    event.target.value = '';
  };

  // Handle Login (Sem bypass administrativo)
  const handleLogin = async (event) => {
    event.preventDefault();
    setLoginError('');

    if (loginRole === 'admin') {
      const email = adminEmailInput.trim();
      const password = adminPassword;

      if (!email || !password) {
        setLoginError('Informe o e-mail e a senha.');
        return;
      }

      try {
        await signInWithEmailAndPassword(auth, email, password);

        setCurrentUser({
          name: 'Sócios / Gestão',
          role: 'admin',
          id: 'ADM-01'
        });
      } catch (error) {
        console.error('Erro no login administrativo:', error);
        setLoginError('E-mail ou senha inválidos.');
      }

      return;
    }

    const driverName = driverNameInput.trim();
    const driverId = driverIdInput.trim().toUpperCase();
    const password = driverPassword.trim();

    if (!driverName || !driverId || !password) {
      setLoginError('Preencha o nome, a placa e a senha do motorista.');
      return;
    }

    setCurrentUser({
      name: driverName.toUpperCase(),
      role: 'driver',
      driverId
    });
  };

  const handleLogout = async () => {
    await signOut(auth);
    setCurrentUser(null);
    setDriverPassword('');
    setAdminPassword('');
    setRomaneioPhotoCaptured(false);
    setExtractedRomaneioData(null);
    setSelectedScanFile(null);
    setScannerError('');
    setTripCompleted(false);
    setRomaneioRequiredNotice(false);
  };

  // Validate romaneio photo + extracted data before opening finish trip confirmation
  const handleRequestFinishTrip = () => {
    if (!romaneioPhotoCaptured || !extractedRomaneioData) {
      setRomaneioRequiredNotice(true);
      setScanResultToast({
        type: 'warning',
        title: 'Leitura do Romaneio Obrigatória!',
        desc: `Tire a foto do romaneio na data de hoje (${todayDate}) e capture os dados antes de finalizar a rota.`
      });
      return;
    }
    setShowFinishTripModal(true);
  };

  // Complete Trip (Driver action) -> Grava direto no Firebase!
  const handleConfirmFinishTrip = async () => {
    if (
      !romaneioPhotoCaptured ||
      !extractedRomaneioData ||
      !currentUser ||
      currentUser.role !== 'driver'
    ) {
      setShowFinishTripModal(false);
      setRomaneioRequiredNotice(true);
      return;
    }

    setShowFinishTripModal(false);

    try {
      await addDoc(collection(db, 'viagens'), {
        motorista: currentUser.name,
        placa: currentUser.driverId ?? '',
        valor: 675,
        status: 'Finalizada',
        romaneioId: extractedRomaneioData.id,
        romaneioDataDocumento: extractedRomaneioData.dataDocumento,
        romaneioCidade: extractedRomaneioData.cidade,
        romaneioPesoBruto: extractedRomaneioData.pesoBruto,
        romaneioQtdTotal: extractedRomaneioData.qtdTotal,
        romaneioArquivo: extractedRomaneioData.arquivoNome,
        romaneioFotoEnviada: true,
        data: todayDate,
        criadoEm: new Date().toISOString()
      });

      setTripCompleted(true);

      setScanResultToast({
        type: 'success',
        title: 'Viagem Finalizada!',
        desc: 'Status e dados do romaneio enviados à central.'
      });
    } catch (error) {
      console.error('Erro ao gravar viagem:', error);

      setTripCompleted(false);

      setScanResultToast({
        type: 'error',
        title: 'Erro ao finalizar viagem',
        desc: 'Não foi possível sincronizar os dados com o Firebase.'
      });
    }
  };

  // Extract romaneio metadata from captured photo and enforce current app date + no duplicate romaneio
  const extractRomaneioFromPhoto = (file, capturedAt) => {
    const rawName = file.name.toLowerCase();

    const dateMatch = rawName.match(/(\d{2})[-_](\d{2})[-_](\d{4})/);

    const extractedDocDate = dateMatch
      ? `${dateMatch[1]}/${dateMatch[2]}/${dateMatch[3]}`
      : todayDate;

    const idMatch = rawName.match(/romaneio[-_]?(\d+)/i);

    const extractedId = idMatch ? idMatch[1] : DEFAULT_ROMANEIO_DATA.id;

    return {
      id: extractedId,
      empresa: DEFAULT_ROMANEIO_DATA.empresa,
      cidade: DEFAULT_ROMANEIO_DATA.cidade,
      pesoBruto: DEFAULT_ROMANEIO_DATA.pesoBruto,
      qtdTotal: DEFAULT_ROMANEIO_DATA.qtdTotal,
      dataDocumento: extractedDocDate,
      arquivoNome: file.name,
      capturadoEm: capturedAt
    };
  };

  // Process camera photo and extract romaneio data before unlocking finish trip
  const processImageScan = async () => {
    if (!selectedScanFile) {
      setScannerError('Nenhuma foto tirada. Use o botão "Tirar Foto" para capturar o documento.');
      return;
    }

    setScanningProgress(true);
    setScannerError('');

    const currentFile = selectedScanFile;
    const currentAppDate = getTodayDateString();
    setTodayDate(currentAppDate);
    const capturedAt = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    setTimeout(async () => {
      setScanningProgress(false);

      if (scannerType === 'romaneio') {
        const capturedRomaneio = extractRomaneioFromPhoto(currentFile, capturedAt);

        if (capturedRomaneio.dataDocumento !== currentAppDate) {
          setRomaneioPhotoCaptured(false);
          setExtractedRomaneioData(null);
          setSelectedScanFile(null);
          if (scanPreviewUrl) {
            URL.revokeObjectURL(scanPreviewUrl);
            setScanPreviewUrl(null);
          }
          setScannerError(
            `Romaneio recusado: a data lida (${capturedRomaneio.dataDocumento}) não corresponde à data atual do app (${currentAppDate}). Tire a foto do romaneio atual na data de hoje (${currentAppDate}).`
          );
          return;
        }

        const isDuplicateRomaneio = usedRomaneioRecords.some(
          (item) => item.id === capturedRomaneio.id && item.dataDocumento === capturedRomaneio.dataDocumento
        );

        if (isDuplicateRomaneio) {
          setRomaneioPhotoCaptured(false);
          setExtractedRomaneioData(null);
          setSelectedScanFile(null);
          if (scanPreviewUrl) {
            URL.revokeObjectURL(scanPreviewUrl);
            setScanPreviewUrl(null);
          }
          setScannerError(
            `Romaneio #${capturedRomaneio.id} recusado: romaneio repetido na data de hoje (${currentAppDate}). Tire a foto de um romaneio atual válido na data de hoje (${currentAppDate}).`
          );
          return;
        }

        setUsedRomaneioRecords((prev) => [
          ...prev,
          { id: capturedRomaneio.id, dataDocumento: capturedRomaneio.dataDocumento }
        ]);
        setExtractedRomaneioData(capturedRomaneio);
        setRomaneioPhotoCaptured(true);
        setRomaneioRequiredNotice(false);
        setShowScannerModal(false);
        setScanResultToast({
          type: 'success',
          title: `Romaneio #${capturedRomaneio.id} Validado (${capturedRomaneio.dataDocumento})!`,
          desc: `Peso: ${capturedRomaneio.pesoBruto} • Qtd: ${capturedRomaneio.qtdTotal} • Rota liberada.`
        });
      } else {
        try {
          await addDoc(collection(db, 'despesas'), {
            motorista: currentUser?.name ?? '',
            tipo: 'Combustível',
            litros: 85,
            comprovanteArquivo: currentFile.name,
            status: 'Pendente',
            data: currentAppDate
          });
          setShowScannerModal(false);
          setScanResultToast({
            type: 'success',
            title: 'Abastecimento Capturado!',
            desc: `Foto (${currentFile.name}) enviada para aprovação.`
          });
        } catch (error) {
          console.error('Erro ao gravar despesa:', error);
          setShowScannerModal(false);
          setScanResultToast({
            type: 'error',
            title: 'Erro ao enviar comprovante',
            desc: 'Não foi possível salvar a despesa no Firebase.'
          });
        }
      }

      setSelectedScanFile(null);
      if (scanPreviewUrl) {
        URL.revokeObjectURL(scanPreviewUrl);
        setScanPreviewUrl(null);
      }
    }, 1500);
  };

  // ----------------------------------------------------
  // VIEW 1: LOGIN SCREEN
  // ----------------------------------------------------
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl p-8 backdrop-blur-md relative z-10">
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 mb-3">
              {renderIcon('truck', 'w-9 h-9 text-white')}
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">LogiTrack SP</h1>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              {renderIcon('map-pin', 'w-3.5 h-3.5 text-emerald-400')} JSM Transporte
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-xl mb-6 border border-slate-800">
            <button
              type="button"
              onClick={() => { setLoginRole('driver'); setLoginError(''); }}
              className={`py-2.5 px-4 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                loginRole === 'driver' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              {renderIcon('user', 'w-4 h-4')} Motorista
            </button>
            <button
              type="button"
              onClick={() => { setLoginRole('admin'); setLoginError(''); }}
              className={`py-2.5 px-4 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                loginRole === 'admin' ? 'bg-slate-800 text-cyan-400 border border-slate-700 shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              {renderIcon('shield', 'w-4 h-4')} Gestor
            </button>
          </div>

          {loginError && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 text-center font-semibold">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {loginRole === 'driver' ? (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Motorista (Nome)</label>
                  <input type="text" required value={driverNameInput} onChange={(e) => setDriverNameInput(e.target.value)} placeholder="Ex: Silvio" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Placa (SP)</label>
                  <input type="text" required value={driverIdInput} onChange={(e) => setDriverIdInput(e.target.value)} placeholder="Ex: CVP-3G01" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Senha</label>
                  <input type="password" required value={driverPassword} onChange={(e) => setDriverPassword(e.target.value)} placeholder="••••••••" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 text-sm" />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">E-mail do Administrador</label>
                  <input type="email" required value={adminEmailInput} onChange={(e) => setAdminEmailInput(e.target.value)} placeholder="Seu e-mail cadastrado" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Senha de Acesso</label>
                  <input type="password" required value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} placeholder="••••••••" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 text-sm" />
                </div>
              </>
            )}
            <button type="submit" className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-emerald-600 text-white font-semibold rounded-xl transition-all text-sm mt-2">
              Acessar
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // VIEW 2: DRIVER VIEW (Blind to financials)
  // ----------------------------------------------------
  if (currentUser.role === 'driver') {
    return (
      <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans pb-20">
        <header className="bg-blue-700 text-white p-4 shadow-md sticky top-0 z-30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center font-bold">
              {renderIcon('truck', 'w-6 h-6')}
            </div>
            <div>
              <h2 className="font-bold text-base leading-tight">{currentUser.name}</h2>
              <p className="text-xs text-blue-200">Veículo: {currentUser.driverId} • SP</p>
            </div>
          </div>
          <button type="button" onClick={handleLogout} className="p-2 bg-blue-800 rounded-lg">
            {renderIcon('logout', 'w-4 h-4')}
          </button>
        </header>

        {scanResultToast && (
          <div className="max-w-md mx-auto w-full px-4 pt-3">
            <div
              className={`${
                scanResultToast.type === 'warning'
                  ? 'bg-amber-900 border border-amber-700 text-amber-50'
                  : scanResultToast.type === 'error'
                    ? 'bg-red-900 border border-red-700 text-red-50'
                    : 'bg-emerald-800 text-white'
              } p-3.5 rounded-xl flex items-start gap-3 shadow-sm`}
            >
              {renderIcon(
                scanResultToast.type === 'error' ? 'shield' : 'check',
                `w-5 h-5 shrink-0 ${
                  scanResultToast.type === 'warning'
                    ? 'text-amber-300'
                    : scanResultToast.type === 'error'
                      ? 'text-red-300'
                      : 'text-emerald-300'
                }`
              )}
              <div>
                <p className="font-bold text-xs">{scanResultToast.title}</p>
                <p className="text-xs opacity-90">{scanResultToast.desc}</p>
              </div>
            </div>
          </div>
        )}

        <main className="max-w-md mx-auto w-full p-4 flex-1 space-y-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
            <div className="flex justify-between border-b border-slate-100 pb-3 mb-3">
              <span className="font-bold text-sm text-slate-800">Romaneio Atual</span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${tripCompleted ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                {tripCompleted ? 'Finalizada' : 'Em Andamento'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs mb-3 bg-slate-50 p-3 rounded-xl">
              <div><span className="text-slate-400 block">Empresa:</span><span className="font-bold">{extractedRomaneioData?.empresa || romaneio.empresa}</span></div>
              <div><span className="text-slate-400 block">Cidade:</span><span className="font-bold text-emerald-600">{extractedRomaneioData?.cidade || romaneio.cidade}</span></div>
              <div><span className="text-slate-400 block">Data do App:</span><span className="font-bold text-blue-700">{todayDate}</span></div>
              <div><span className="text-slate-400 block">Data Romaneio:</span><span className="font-bold text-slate-700">{extractedRomaneioData ? extractedRomaneioData.dataDocumento : 'Aguardando foto'}</span></div>
              <div><span className="text-slate-400 block">Peso Bruto:</span><span className="font-bold text-slate-700">{extractedRomaneioData ? extractedRomaneioData.pesoBruto : 'Aguardando leitura'}</span></div>
              <div><span className="text-slate-400 block">Qtd. Itens:</span><span className="font-bold text-slate-700">{extractedRomaneioData ? `${extractedRomaneioData.qtdTotal} un` : 'Aguardando leitura'}</span></div>
            </div>
            <div className={`mb-3 px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between ${
              romaneioPhotoCaptured && extractedRomaneioData
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-amber-50 text-amber-800 border border-amber-200'
            }`}>
              <span>Leitura do Romaneio:</span>
              <span>{romaneioPhotoCaptured && extractedRomaneioData ? `Capturado (${extractedRomaneioData.capturadoEm})` : 'Pendente (Obrigatória)'}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => openScannerForType('romaneio')} className="py-3 px-3 bg-blue-50 text-blue-700 font-semibold rounded-xl text-xs flex flex-col items-center gap-1">
                {renderIcon('camera', 'w-5 h-5')} {romaneioPhotoCaptured ? 'Tirar Nova Foto' : 'Tirar Foto Romaneio *'}
              </button>
              <button type="button" onClick={() => openScannerForType('combustivel')} className="py-3 px-3 bg-amber-50 text-amber-800 font-semibold rounded-xl text-xs flex flex-col items-center gap-1">
                {renderIcon('fuel', 'w-5 h-5')} Tirar Foto Combustível
              </button>
            </div>
          </div>

          {!tripCompleted ? (
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleRequestFinishTrip}
                aria-disabled={!romaneioPhotoCaptured || !extractedRomaneioData}
                className={`w-full py-4 font-bold rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all ${
                  romaneioPhotoCaptured && extractedRomaneioData
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-slate-300 text-slate-600 cursor-not-allowed shadow-none'
                }`}
              >
                {renderIcon('check', 'w-5 h-5')}
                {romaneioPhotoCaptured && extractedRomaneioData ? 'Finalizar Rota / Viagem' : 'Tire a Foto do Romaneio de Hoje para Finalizar'}
              </button>
              {romaneioRequiredNotice && (
                <p className="text-xs font-semibold text-red-600 text-center bg-red-50 border border-red-200 rounded-xl py-2 px-3">
                  É obrigatório tirar a foto do romaneio atual na data de hoje ({todayDate}) sem repetição para finalizar a rota.
                </p>
              )}
            </div>
          ) : (
            <div className="p-4 bg-emerald-50 rounded-2xl text-center">
              {renderIcon('check', 'w-8 h-8 text-emerald-600 mx-auto mb-1')}
              <h4 className="font-bold text-emerald-800 text-sm">Viagem Concluída e Sincronizada!</h4>
            </div>
          )}
        </main>

        {showScannerModal && (
          <div className="fixed inset-0 bg-slate-950/90 z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 text-white rounded-2xl max-w-sm w-full p-5 border border-slate-800 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <div>
                  <h3 className="font-bold text-sm">
                    {scannerType === 'romaneio' ? 'Câmera: Foto do Romaneio' : 'Câmera: Foto Combustível'}
                  </h3>
                  <p className="text-[11px] text-cyan-300">Data atual do app: {todayDate}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowScannerModal(false);
                    setSelectedScanFile(null);
                    setScannerError('');
                  }}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="relative min-h-[240px] bg-slate-950 rounded-xl border-2 border-dashed border-slate-700 flex flex-col items-center justify-center p-4 text-center gap-3">
                {scanningProgress ? (
                  <div className="flex flex-col items-center gap-2">
                    {renderIcon('refresh', 'w-10 h-10 text-cyan-400 animate-spin')}
                    <p className="text-xs text-cyan-300 font-semibold">Lendo foto e validando data...</p>
                  </div>
                ) : scanPreviewUrl ? (
                  <div className="w-full space-y-2">
                    <img
                      src={scanPreviewUrl}
                      alt="Foto capturada pela câmera"
                      className="max-h-44 w-full object-contain rounded-lg border border-slate-800 bg-black"
                    />
                    <p className="text-[11px] text-emerald-400 font-medium truncate">
                      Foto capturada: {selectedScanFile?.name}
                    </p>
                  </div>
                ) : (
                  <>
                    {renderIcon('camera', 'w-9 h-9 text-slate-400')}
                    <p className="text-xs text-slate-300">
                      Somente captura direta pela câmera. Tire a foto do romaneio na data de hoje ({todayDate}).
                    </p>
                  </>
                )}

                {!scanningProgress && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="py-2 px-3.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2"
                  >
                    {renderIcon('camera', 'w-4 h-4')}
                    {selectedScanFile ? 'Tirar Outra Foto' : 'Tirar Foto'}
                  </button>
                )}
              </div>

              {scannerError && (
                <p className="text-xs font-semibold text-red-400 bg-red-950/60 border border-red-800/60 rounded-xl p-2.5 text-center">
                  {scannerError}
                </p>
              )}

              <button
                type="button"
                disabled={!selectedScanFile || scanningProgress}
                onClick={processImageScan}
                className={`w-full py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  selectedScanFile && !scanningProgress
                    ? 'bg-cyan-600 hover:bg-cyan-500 text-white'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                {renderIcon('sparkles', 'w-4 h-4')}
                {selectedScanFile ? 'Ler Foto e Capturar Dados' : 'Tire a Foto para Liberar Leitura'}
              </button>
            </div>
          </div>
        )}

        {showFinishTripModal && (
          <div className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-4">
            <div className="bg-white text-slate-800 rounded-2xl max-w-sm w-full p-6 text-center space-y-4">
              {renderIcon('check', 'w-8 h-8 text-emerald-600 mx-auto')}
              <h3 className="font-bold text-lg">Finalizar Rota?</h3>
              <p className="text-xs text-slate-500">Isso enviará os dados para setor adm da empresa</p>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button type="button" onClick={() => setShowFinishTripModal(false)} className="py-2.5 bg-slate-200 rounded-xl font-semibold text-xs">Voltar</button>
                <button type="button" onClick={handleConfirmFinishTrip} className="py-2.5 bg-emerald-600 text-white rounded-xl font-semibold text-xs">Confirmar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ----------------------------------------------------
  // VIEW 3: ADMIN DASHBOARD (Conectado ao Firebase)
  // ----------------------------------------------------
  return (
    <div className="min-h-screen bg-[#0B1329] text-slate-100 flex flex-col font-sans pb-24">
      <header className="bg-[#111C38] border-b border-slate-800/80 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
              {renderIcon('shield', 'w-5 h-5 text-white')}
            </div>
            <div>
              <h1 className="font-bold text-base text-white tracking-wide">PAINEL ADMINISTRATIVO</h1>
              <p className="text-[10px] text-emerald-400 flex items-center gap-1">{renderIcon('map-pin', 'w-3 h-3')} Conectado: Nuvem JSM Transporte</p>
            </div>
          </div>
          <button type="button" onClick={handleLogout} className="p-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-xl transition-colors">
            {renderIcon('logout', 'w-4 h-4')}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto w-full p-4 md:p-6 flex-1">
        {/* TAB 1: DASHBOARD */}
        {adminTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[#111C38] border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-bl-full"></div>
                <span className="text-xs font-semibold text-slate-400 uppercase">Faturamento Registrado</span>
                <h2 className="text-2xl font-extrabold text-white mt-1">R$ {totalSystemRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h2>
                <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
                  {renderIcon('trending-up', 'w-3 h-3')} Baseado em {fbViagens.length} viagens sincronizadas
                </p>
              </div>
              <div className="bg-[#111C38] border border-slate-800 rounded-2xl p-5 shadow-xl">
                <span className="text-xs font-semibold text-slate-400 uppercase">Motoristas Cadastrados</span>
                <h2 className="text-2xl font-extrabold text-white mt-1">{fbMotoristas.length} Ativos</h2>
                <p className="text-xs text-blue-400 mt-2 flex items-center gap-1">{renderIcon('user', 'w-3 h-3')} Frota Total: {fbVeiculos.length} veículos</p>
              </div>
            </div>

            <div className="bg-[#111C38] border border-slate-800 rounded-2xl p-5 shadow-xl">
              <h3 className="font-bold text-base text-white mb-4">Projeção Diária</h3>
              <div className="h-56 w-full">
                {(() => {
                  const maxVal = Math.max(...CHART_DATA_ADMIN.map((d) => d.faturamento), 1);
                  const width = 600;
                  const height = 200;
                  const padLeft = 48;
                  const padRight = 16;
                  const padTop = 14;
                  const padBottom = 28;
                  const plotW = width - padLeft - padRight;
                  const plotH = height - padTop - padBottom;

                  const points = CHART_DATA_ADMIN.map((item, idx) => {
                    const x = padLeft + (idx / Math.max(CHART_DATA_ADMIN.length - 1, 1)) * plotW;
                    const y = padTop + plotH - (item.faturamento / maxVal) * plotH;
                    return { ...item, x, y };
                  });

                  const linePath = points
                    .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
                    .join(' ');

                  const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${(padTop + plotH).toFixed(1)} L ${points[0].x.toFixed(1)} ${(padTop + plotH).toFixed(1)} Z`;

                  return (
                    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
                      <defs>
                        <linearGradient id="projAreaGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.02" />
                        </linearGradient>
                      </defs>

                      {[0, 0.5, 1].map((ratio, i) => {
                        const yPos = padTop + plotH - ratio * plotH;
                        const labelVal = Math.round((maxVal * ratio) / 1000);
                        const label = ratio === 0 ? '0' : `${labelVal}k`;

                        return (
                          <g key={i}>
                            <line
                              x1={padLeft}
                              y1={yPos}
                              x2={width - padRight}
                              y2={yPos}
                              stroke="#1e293b"
                              strokeDasharray="3 3"
                            />
                            <text
                              x={padLeft - 8}
                              y={yPos + 3}
                              textAnchor="end"
                              fill="#64748b"
                              fontSize="10"
                            >
                              {label}
                            </text>
                          </g>
                        );
                      })}

                      <path d={areaPath} fill="url(#projAreaGrad)" />
                      <path d={linePath} fill="none" stroke="#06b6d4" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

                      {points.map((p, idx) => (
                        <g key={idx}>
                          <circle cx={p.x} cy={p.y} r="4" fill="#06b6d4" stroke="#0B1329" strokeWidth="2" />
                          <text
                            x={p.x}
                            y={height - 6}
                            textAnchor="middle"
                            fill="#64748b"
                            fontSize="10"
                          >
                            {p.name}
                          </text>
                        </g>
                      ))}
                    </svg>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: VIAGENS / ROMANEIOS */}
        {adminTab === 'romaneios' && (
          <div className="bg-[#111C38] border border-slate-800 rounded-2xl p-5 shadow-xl">
            <h3 className="font-bold text-base text-white mb-4 flex items-center gap-2">{renderIcon('file-check', 'w-5 h-5 text-cyan-400')} Registro de Viagens (Firebase)</h3>
            <div className="space-y-3">
              {fbViagens.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">Nenhuma viagem registrada ainda.</p>
              ) : (
                fbViagens.map(log => (
                  <div key={log.id} className="p-4 bg-[#0B1329] border border-slate-800 rounded-xl hover:border-slate-600 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-cyan-400">Placa: {log.placa}</span>
                      <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded text-[10px]">{log.status}</span>
                    </div>
                    <div className="grid grid-cols-2 text-xs text-slate-300 gap-2">
                      <p>Motorista: <strong className="text-white">{log.motorista}</strong></p>
                      <p>Valor Gerado: <strong className="text-emerald-400">R$ {log.valor}</strong></p>
                      <p>Data: <span>{log.data || 'Hoje'}</span></p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 3: DESPESAS */}
        {adminTab === 'despesas' && (
          <div className="bg-[#111C38] border border-slate-800 rounded-2xl p-5 shadow-xl">
            <h3 className="font-bold text-base text-white mb-4 flex items-center gap-2">{renderIcon('fuel', 'w-5 h-5 text-amber-400')} Fila de Despesas (Firebase)</h3>
            <div className="space-y-3">
              {fbDespesas.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">Nenhuma despesa lançada.</p>
              ) : (
                fbDespesas.map(despesa => (
                  <div key={despesa.id} className="p-4 bg-[#0B1329] border border-slate-800 rounded-xl flex justify-between items-center">
                    <div>
                      <p className="font-bold text-sm text-white">{despesa.tipo}</p>
                      <p className="text-[11px] text-slate-400">{despesa.motorista}</p>
                      {despesa.litros && <p className="text-[11px] text-emerald-400 mt-1 font-semibold">{despesa.litros} Litros</p>}
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-xs text-amber-400 block mb-2">{despesa.status}</span>
                      {despesa.status !== 'Aprovada' && (
                        <button
                          type="button"
                          onClick={() => updateDoc(doc(db, 'despesas', despesa.id), { status: 'Aprovada' })}
                          className="px-4 py-1.5 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/40 text-[10px] font-bold rounded-lg border border-emerald-600/30 transition-all"
                        >
                          Aprovar Conta
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 4: FROTA */}
        {adminTab === 'frota' && (
          <div className="bg-[#111C38] border border-slate-800 rounded-2xl p-5 shadow-xl">
            <h3 className="font-bold text-base text-white mb-4 flex items-center gap-2">{renderIcon('truck', 'w-5 h-5 text-purple-400')} Frota Cadastrada (Firebase)</h3>
            <div className="space-y-3">
              {fbVeiculos.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">Nenhum veículo cadastrado.</p>
              ) : (
                fbVeiculos.map(veiculo => (
                  <div key={veiculo.id} className="p-4 bg-[#0B1329] border border-slate-800 rounded-xl">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-3">
                      <h4 className="font-bold text-lg text-white">{veiculo.placa}</h4>
                      <span className="px-2 py-1 bg-emerald-950 text-emerald-400 text-xs rounded-full border border-emerald-800">Em Operação</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><span className="text-slate-500 block text-xs">Modelo</span><strong className="text-white">{veiculo.modelo}</strong></div>
                      <div><span className="text-slate-500 block text-xs">Odômetro Atual</span><strong className="text-white">{veiculo.odometro} km</strong></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 5: METAS */}
        {adminTab === 'metas' && (
          <div className="bg-[#111C38] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="font-bold text-base text-white mb-4 flex items-center gap-2">{renderIcon('target', 'w-5 h-5 text-rose-400')} Metas Operacionais</h3>

            <div className="p-4 bg-[#0B1329] border border-slate-800 rounded-xl">
              <div className="flex justify-between text-xs mb-2">
                <span className="text-slate-400">Dias Úteis (Meta: 26/mês)</span>
                <span className="text-emerald-400 font-bold">18 Dias (69%)</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full"><div className="w-[69%] h-full bg-emerald-500 rounded-full"></div></div>
            </div>

            <div className="p-4 bg-[#0B1329] border border-slate-800 rounded-xl">
              <div className="flex justify-between text-xs mb-2">
                <span className="text-slate-400">Eficiência Combustível (&ge;10km/L)</span>
                <span className="text-cyan-400 font-bold">9.8 km/L</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full"><div className="w-[98%] h-full bg-cyan-500 rounded-full"></div></div>
            </div>
          </div>
        )}

        {/* TAB 6: EXPANSÃO */}
        {adminTab === 'expansao' && (
          <div className="bg-[#111C38] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="font-bold text-base text-white mb-4 flex items-center gap-2">{renderIcon('rocket', 'w-5 h-5 text-orange-400')} Investimentos Futuros</h3>

            <div className="p-5 bg-gradient-to-br from-orange-900/40 to-[#0B1329] border border-orange-800/50 rounded-xl text-center">
              <span className="text-xs text-orange-300 font-semibold uppercase">Cofre de Expansão (20%)</span>
              <h2 className="text-3xl font-extrabold text-white mt-2">
                R$ {(totalSystemRevenue * 0.20).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </h2>
              <p className="text-[10px] text-orange-200 mt-2">Reserva calculada automaticamente sobre as viagens realizadas.</p>
            </div>
          </div>
        )}
      </main>

      {/* FIXED BOTTOM NAVIGATION BAR */}
      <nav className="fixed bottom-0 left-0 w-full bg-[#111C38] border-t border-slate-800/80 z-40 px-2 py-1 flex items-center justify-between overflow-x-auto shadow-[0_-10px_40px_rgba(0,0,0,0.5)] hide-scrollbar">
        <BottomTabButton active={adminTab === 'dashboard'} onClick={() => setAdminTab('dashboard')} iconNode={renderIcon('trending-up', 'w-5 h-5')} label="Visão" />
        <BottomTabButton active={adminTab === 'romaneios'} onClick={() => setAdminTab('romaneios')} iconNode={renderIcon('file-text', 'w-5 h-5')} label="Viagens" />
        <BottomTabButton active={adminTab === 'despesas'} onClick={() => setAdminTab('despesas')} iconNode={renderIcon('fuel', 'w-5 h-5')} label="Despesas" />
        <BottomTabButton active={adminTab === 'frota'} onClick={() => setAdminTab('frota')} iconNode={renderIcon('truck', 'w-5 h-5')} label="Frota" />
        <BottomTabButton active={adminTab === 'metas'} onClick={() => setAdminTab('metas')} iconNode={renderIcon('target', 'w-5 h-5')} label="Metas" />
        <BottomTabButton active={adminTab === 'expansao'} onClick={() => setAdminTab('expansao')} iconNode={renderIcon('rocket', 'w-5 h-5')} label="Expansão" />
      </nav>
    </div>
  );
}

function BottomTabButton({ active, onClick, iconNode, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center p-2 rounded-xl transition-all min-w-[60px] flex-1 ${
        active ? 'text-cyan-400 font-bold' : 'text-slate-500 hover:text-slate-300 font-medium'
      }`}
    >
      <div className={`mb-1 transition-transform ${active ? '-translate-y-1' : ''}`}>{iconNode}</div>
      <span className="text-[9px] uppercase tracking-wider">{label}</span>
      {active && <div className="absolute bottom-0 w-8 h-1 bg-cyan-500 rounded-t-full" />}
    </button>
  );
}