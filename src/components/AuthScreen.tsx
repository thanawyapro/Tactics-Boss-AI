import React, { useState, useEffect } from 'react';
import { Mail, Lock, User, Eye, EyeOff, Gamepad2, LogIn, UserPlus, CheckCircle2, AlertCircle, Trophy, Sparkles } from 'lucide-react';
import { getSupabase } from '../lib/supabaseClient';

interface AuthScreenProps {
  onAuthSuccess: (session: any) => void;
  lang: 'ar' | 'en' | 'es' | 'fr';
}

export default function AuthScreen({ onAuthSuccess, lang }: AuthScreenProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [favGame, setFavGame] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Validation touches & states
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [displayNameTouched, setDisplayNameTouched] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = emailRegex.test(email);
  const isPasswordValid = password.length >= 6;
  const isDisplayNameValid = displayName.trim().length >= 2;

  // Localized dictionaries supporting Arabic, English, Spanish, French
  const dict = {
    ar: {
      title: "تكتيك بوس AI",
      subtitle: "مساعد التكتيك المتكامل وغرفة التدريب الذكية لألعاب FC25 و eFootball",
      loginTab: "تسجيل الدخول",
      signupTab: "إنشاء حساب المدرب",
      emailLabel: "البريد الإلكتروني الذكي",
      passwordLabel: "رمز المرور (مفتاح التكتيك)",
      nameLabel: "اسم الشهرة التدريبي",
      favGameLabel: "اللعبة الرئيسية (مثال: FC25 / eFootball)",
      loginBtn: "صعود المنصة والدخول",
      signupBtn: "توقيع عقد المدرب والبدء",
      googleBtn: "الدخول السريع بحساب Google",
      orConnect: "أو عبر خيارات الاستكشاف",
      passError: "رمز المرور يجب ألا يقل عن 6 خانات كروية",
      fieldsError: "تأكد من استكمال كافة متطلبات رخصة التدريب",
      emailHelp: "أدخل بريد احترافي للحصول على تحليلات الميتا",
      displayNameHelp: "هذا الاسم سيظهر كمحلل تكتيكي رئيسي",
      fbPrompt: "فيسبوك (قريباً في الموسم القادم)",
      applePrompt: "آبل (تحت الصيانة الفنية)"
    },
    en: {
      title: "Tactic Boss AI",
      subtitle: "Your Elite Tactical Board & AI Game Analyst for FC25 & eFootball",
      loginTab: "Sign In",
      signupTab: "Register Franchise",
      emailLabel: "Professional Email",
      passwordLabel: "Password Credentials",
      nameLabel: "Coach Signature ID (Name)",
      favGameLabel: "Preferred Gameplay (e.g. FC25, PES)",
      loginBtn: "Enter Stadium Command",
      signupBtn: "Sign Official Contract",
      googleBtn: "Secure Google Authorization",
      orConnect: "Or via scout networks",
      passError: "Password requires 6 characters minimum",
      fieldsError: "Please populate all necessary tactical clearances",
      emailHelp: "Use your main active email to sync scouting sheets",
      displayNameHelp: "Your custom manager alias displayed on leaderboards",
      fbPrompt: "Facebook (Coming Next Season)",
      applePrompt: "Apple (Under Technical Maintenance)"
    },
    es: {
      title: "Tactic Boss AI",
      subtitle: "Tu Pizarra de Tácticas de Élite y Analista de Inteligencia de FC25",
      loginTab: "Iniciar Sesión",
      signupTab: "Registrar Entrenador",
      emailLabel: "Correo Electrónico",
      passwordLabel: "Contraseña",
      nameLabel: "Apodo del Míster",
      favGameLabel: "Juego Favorito (ej. FC25)",
      loginBtn: "Entrar al Estadio",
      signupBtn: "Firmar Contrato Oficial",
      googleBtn: "Iniciar con Google",
      orConnect: "O mediante redes de exploración",
      passError: "La contraseña debe tener al menos 6 caracteres",
      fieldsError: "Por favor complete todas las credenciales requeridas",
      emailHelp: "Tu correo oficial para recibir análisis tácticos",
      displayNameHelp: "Tu alias de entrenador para los análisis",
      fbPrompt: "Facebook (Próximamente)",
      applePrompt: "Apple (Mantenimiento Técnico)"
    },
    fr: {
      title: "Tactic Boss AI",
      subtitle: "Votre Tableau Tactique d'Élite & Analyste IA pour FC25 & eFootball",
      loginTab: "Connexion",
      signupTab: "S'enregistrer",
      emailLabel: "Adresse E-mail",
      passwordLabel: "Mot de passe",
      nameLabel: "Nom d'Entraîneur",
      favGameLabel: "Jeu de Prédilection (ex. FC25)",
      loginBtn: "Entrer au Stade",
      signupBtn: "Signer le Contrat",
      googleBtn: "Connexion avec Google",
      orConnect: "Ou par canaux de recrutement",
      passError: "Le mot de passe doit contenir au moins 6 caractères",
      fieldsError: "Veuillez remplir toutes les informations d'accès",
      emailHelp: "Votre e-mail pour synchroniser vos rapports de scouts",
      displayNameHelp: "Votre alias affiché sur les rapports tactiques",
      fbPrompt: "Facebook (Bientôt)",
      applePrompt: "Apple (Maintenance Technique)"
    }
  };

  const activeLang = dict[lang] ? lang : 'en';
  const t = dict[activeLang];

  // Simulated professional soccer coaching steps to improve loading engagement
  const loadingStepsAr = [
    "جاري فحص أرضية الملعب وعشب الاستاد...",
    "جاري تحليل تكتيكات الميتا الأخيرة لخصومك...",
    "تهيئة اللوحة التكتيكية الرقمية الحرة...",
    "بناء التشكيلة واستدعاء الكشاف الذكي...",
    "جاهز تماماً! نلتقي عند صافرة الانطلاق..."
  ];

  const loadingStepsEn = [
    "Analyzing stadium outline and turf condition...",
    "Scouting active Meta patterns of rival squads...",
    "Initializing digital canvas & drawing layer...",
    "Assembling line-up vectors and database sync...",
    "Squad is ready! Heading to the pitch..."
  ];

  const loadingStepsEs = [
    "Analizando el terreno de juego y el césped...",
    "Evaluando patrones tácticos de los rivales...",
    "Inicializando la pizarra digital de tácticas...",
    "Ensamblando vectores de alineación recomendados...",
    "¡Todo listo! Saliendo al campo..."
  ];

  const loadingStepsFr = [
    "Analyse de la pelouse et de l'état du stade...",
    "Évaluation des schémas tactiques de Meta...",
    "Initialisation du stylet et du tableau tactique...",
    "Assemblage de l'effectif aligné sur le cloud...",
    "Prêt pour le match! Coup d'envoi imminent..."
  ];

  const loadingSteps = activeLang === 'ar' ? loadingStepsAr :
                       activeLang === 'es' ? loadingStepsEs :
                       activeLang === 'fr' ? loadingStepsFr : loadingStepsEn;

  // Rotate loading step phrases when loading is active
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev < loadingSteps.length - 1 ? prev + 1 : prev));
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Final checks
    if (!isEmailValid || !isPasswordValid) {
      setErrorMessage(t.fieldsError);
      return;
    }
    if (activeTab === 'signup' && !isDisplayNameValid) {
      setErrorMessage(t.fieldsError);
      return;
    }

    const sb = getSupabase();
    if (!sb) {
      setErrorMessage(
        lang === 'ar' 
          ? "لم يتم العثور على إعدادات اتصال Supabase. يرجى تهيئة اتصال قاعدة البيانات للاستمرار." 
          : "Supabase connection values are missing. Please configure your database credentials to proceed."
      );
      return;
    }

    setIsLoading(true);

    try {
      if (activeTab === 'login') {
        const { data, error } = await sb.auth.signInWithPassword({
          email,
          password
        });

        if (error) throw error;

        setSuccessMessage(lang === 'ar' ? "تم تسجيل دخولك بنجاح! جاري تحضير دكة البدلاء..." : "Successfully logged in! Setting up tactics deck...");
        setTimeout(() => {
          onAuthSuccess(data.session);
        }, 1200);
      } else {
        const { data, error } = await sb.auth.signUp({
          email,
          password,
          options: {
            data: {
              display_name: displayName || "Coach",
              favorite_game: favGame || "FC25"
            }
          }
        });

        if (error) throw error;

        const user = data.user;
        if (user) {
          await sb.from('users_profile').insert({
            user_id: user.id,
            display_name: displayName || "Coach",
            favorite_game: favGame || "FC25"
          });
        }

        setSuccessMessage(
          lang === 'ar' 
            ? "تهانينا! تم توقيع العقد بنجاح وعقد رخصة التدريب." 
            : "Congratulations! Manager contract signed successfully."
        );
        setTimeout(() => {
          onAuthSuccess(data.session);
        }, 1500);
      }
    } catch (err: any) {
      console.error("Authentication process error:", err);
      const rawMsg = err.message || "";
      let userFriendly = rawMsg;
      if (rawMsg.includes("Invalid login")) {
        userFriendly = lang === 'ar' 
          ? "البريد الإلكتروني أو رمز المرور غير معترف به لدى الاتحاد التكتيكي" 
          : "Invalid credentials: Match squad not verified in system.";
      } else if (rawMsg.includes("User already registered")) {
        userFriendly = lang === 'ar' 
          ? "هذا البريد مسجل مسبقاً برتبة كابتن معتمد" 
          : "A registered manager is already utilizing this club email.";
      }
      setErrorMessage(userFriendly);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    const sb = getSupabase();
    if (!sb) {
      setErrorMessage(
        lang === 'ar' 
          ? "فشل تأمين اتصال Supabase للتعريف الفوري لجوجل." 
          : "Supabase connection values missing. Cannot start Google auth."
      );
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await sb.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (err: any) {
      console.error("Google Auth error:", err);
      setErrorMessage(err.message || "Failed to initialize Google Sign-in");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#05080e] flex flex-col items-center justify-center p-4 antialiased">
      
      {/* Dynamic Night Stadium CSS Animation Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        
        {/* Sky glow & atmosphere */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#091515] via-[#040810] to-[#010307]" />
        
        {/* Dynamic sweeping stadium floodlights */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full filter blur-3xl animate-pulse" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-600/5 rounded-full filter blur-3xl animate-pulse duration-5000" />
        
        {/* Realistic sweeping light beams */}
        <div className="absolute top-[-50px] left-1/4 w-[120px] h-[600px] bg-white/2 origin-top transform -rotate-12 blur-lg animate-[sweep-light_10s_infinite_alternate]" />
        <div className="absolute top-[-50px] right-1/4 w-[140px] h-[600px] bg-white/3 origin-top transform rotate-12 blur-lg animate-[sweep-right-light_14s_infinite_alternate]" />

        {/* Futuristic Tactical Grid & Field Overlay lines */}
        <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:30px_30px]" />
        
        {/* Absolute field bottom line glow */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-emerald-500/10 to-transparent" />
        
        {/* Stadium circular boundary visual sketch */}
        <div className="absolute bottom-[-100px] left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-[50%] border border-emerald-500/20 shadow-[inset_0_0_100px_rgba(16,185,129,0.08)]" />
        <div className="absolute bottom-[-50px] left-1/2 -translate-x-1/2 w-[400px] h-[200px] rounded-[50%] border border-dashed border-emerald-500/15" />
      </div>

      {/* Main Glassmorphic Clipboard Frame */}
      <div className="w-full max-w-md bg-slate-950/85 border-2 border-slate-800/80 rounded-[35px] p-6 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl relative z-10 overflow-hidden space-y-6">
        
        {/* Holographic Glowing corners */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-violet-500/45 rounded-tl-3xl pointer-events-none" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-emerald-400/45 rounded-tr-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-emerald-400/45 rounded-bl-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-violet-500/45 rounded-br-3xl pointer-events-none" />

        {/* Dynamic background light flares inside card */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Head Branding */}
        <div className="text-center space-y-3 relative z-10">
          <div className="inline-flex relative">
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-violet-600 via-emerald-400 to-indigo-600 blur opacity-65 animate-pulse" />
            <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center shadow-2xl relative">
              <Gamepad2 size={28} className="text-emerald-400 animate-[bounce_3s_infinite]" />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-violet-500 rounded-full p-1 border border-slate-950 shadow">
              <Sparkles size={8} className="text-white fill-white" />
            </div>
          </div>
          
          <div>
            <h1 className="text-2xl font-black text-white tracking-wider flex items-center justify-center gap-2 drop-shadow-[0_2px_10px_rgba(16,185,129,0.3)]">
              {t.title}
              <Trophy size={18} className="text-yellow-400 shrink-0" />
            </h1>
            <p className="text-[11px] text-slate-400 font-medium mt-1.5 max-w-[280px] mx-auto leading-relaxed">
              {t.subtitle}
            </p>
          </div>
        </div>

        {/* Tabs switcher: Sign In vs Sign Up */}
        <div className="grid grid-cols-2 gap-1.5 bg-slate-900/90 p-1.5 rounded-2xl border border-white/5 relative z-10 shadow-inner">
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setErrorMessage(null);
            }}
            className={`py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
              activeTab === 'login'
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <LogIn size={14} />
            <span>{t.loginTab}</span>
          </button>
          
          <button
            type="button"
            onClick={() => {
              setActiveTab('signup');
              setErrorMessage(null);
            }}
            className={`py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
              activeTab === 'signup'
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <UserPlus size={14} />
            <span>{t.signupTab}</span>
          </button>
        </div>

        {/* Error message slot */}
        {errorMessage && (
          <div className={`p-3.5 rounded-2xl bg-red-950/30 border border-red-500/30 text-red-300 text-[11px] flex gap-2.5 items-start shadow-md ${lang === 'ar' ? 'text-right' : 'text-left'}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed font-bold">{errorMessage}</div>
          </div>
        )}

        {/* Success message slot */}
        {successMessage && (
          <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-[11px] flex items-center gap-2 justify-center shadow-md">
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            <div className="leading-relaxed font-bold">{successMessage}</div>
          </div>
        )}

        {/* Authentication Fields Form */}
        <form onSubmit={handleSubmit} className={`space-y-4 text-slate-300 text-xs ${lang === 'ar' ? 'text-right' : 'text-left'}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
          
          {/* Sign Up Specific Name Field */}
          {activeTab === 'signup' && (
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-400 tracking-wide flex items-center gap-1">
                <span>{t.nameLabel}</span>
                <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className={`absolute ${lang === 'ar' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-slate-500 z-10`}>
                  <User size={15} />
                </div>
                <input
                  type="text"
                  required
                  placeholder={lang === 'ar' ? "الكابتن غوارديولا" : "Pep Guardiola"}
                  value={displayName}
                  onBlur={() => setDisplayNameTouched(true)}
                  onChange={(e) => {
                    setDisplayName(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  className={`w-full bg-slate-900/60 border-2 rounded-xl py-2.5 outline-none font-bold transition-all ${
                    lang === 'ar' ? 'pr-10 pl-10' : 'pl-10 pr-10'
                  } ${
                    displayNameTouched
                      ? isDisplayNameValid
                        ? 'border-emerald-500/80 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/20'
                        : 'border-red-500/80 focus:border-red-500 focus:ring-1 focus:ring-red-500/20'
                      : 'border-slate-800/80 focus:border-violet-600/80 focus:ring-1 focus:ring-violet-600/20'
                  }`}
                />
                <div className={`absolute ${lang === 'ar' ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 z-10`}>
                  {displayNameTouched && (
                    isDisplayNameValid 
                      ? <CheckCircle2 size={14} className="text-emerald-400" />
                      : <AlertCircle size={14} className="text-red-400" />
                  )}
                </div>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">{t.displayNameHelp}</p>
            </div>
          )}

          {/* Email Address with validation status */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-400 tracking-wide flex items-center gap-1">
              <span>{t.emailLabel}</span>
              <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className={`absolute ${lang === 'ar' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-slate-500 z-10`}>
                <Mail size={15} />
              </div>
              <input
                type="email"
                required
                placeholder="coach@tacticbossai.com"
                value={email}
                onBlur={() => setEmailTouched(true)}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                className={`w-full bg-slate-900/60 border-2 rounded-xl py-2.5 outline-none font-bold transition-all text-left ${
                  lang === 'ar' ? 'pr-10 pl-10' : 'pl-10 pr-10'
                } ${
                  emailTouched
                    ? isEmailValid
                      ? 'border-emerald-500/80 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/20'
                      : 'border-red-500/80 focus:border-red-500 focus:ring-1 focus:ring-red-500/20'
                    : 'border-slate-800/80 focus:border-violet-600/80 focus:ring-1 focus:ring-violet-600/20'
                }`}
              />
              <div className={`absolute ${lang === 'ar' ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 z-10`}>
                {emailTouched && (
                  isEmailValid 
                    ? <CheckCircle2 size={14} className="text-emerald-400" />
                    : <AlertCircle size={14} className="text-red-400" />
                )}
              </div>
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">{t.emailHelp}</p>
          </div>

          {/* Password field with requirements indicator */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-400 tracking-wide flex items-center gap-1">
              <span>{t.passwordLabel}</span>
              <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className={`absolute ${lang === 'ar' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-slate-500 z-10`}>
                <Lock size={15} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onBlur={() => setPasswordTouched(true)}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                className={`w-full bg-slate-900/60 border-2 rounded-xl py-2.5 outline-none font-bold transition-all text-left ${
                  lang === 'ar' ? 'pr-10 pl-16' : 'pl-10 pr-16'
                } ${
                  passwordTouched
                    ? isPasswordValid
                      ? 'border-emerald-500/80 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/20'
                      : 'border-red-500/80 focus:border-red-500 focus:ring-1 focus:ring-red-500/20'
                    : 'border-slate-800/80 focus:border-violet-600/80 focus:ring-1 focus:ring-violet-600/20'
                }`}
              />
              
              {/* Show / Hide Toggle icon button */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute ${lang === 'ar' ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 z-20 flex items-center gap-1`}
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>

              {/* Password state check icon */}
              <div className={`absolute ${lang === 'ar' ? 'left-10' : 'right-10'} top-1/2 -translate-y-1/2 z-10`}>
                {passwordTouched && (
                  isPasswordValid 
                    ? <CheckCircle2 size={13} className="text-emerald-400" />
                    : <AlertCircle size={13} className="text-red-400" />
                )}
              </div>
            </div>
            
            {/* Live visual passwords strength helper bar */}
            {password.length > 0 && (
              <div className="pt-1.5 space-y-1">
                <div className="flex gap-1 h-1">
                  <div className={`h-full rounded-full flex-grow transition-all duration-300 ${password.length >= 3 ? 'bg-amber-500' : 'bg-red-500'}`} />
                  <div className={`h-full rounded-full flex-grow transition-all duration-300 ${password.length >= 6 ? 'bg-emerald-500' : 'bg-slate-800'}`} />
                  <div className={`h-full rounded-full flex-grow transition-all duration-300 ${password.length >= 9 ? 'bg-violet-500' : 'bg-slate-800'}`} />
                </div>
                <div className="flex justify-between text-[9px] text-slate-500">
                  <span>{lang === 'ar' ? "قوة رمز المرور" : "Credential strength"}</span>
                  <span className={isPasswordValid ? "text-emerald-400 font-bold" : "text-amber-400 font-medium"}>
                    {password.length >= 9 ? (lang === 'ar' ? "تكتيكي حديد" : "Ultra Meta Safe") : 
                     password.length >= 6 ? (lang === 'ar' ? "مقبول ومؤمن" : "Secure") : 
                     (lang === 'ar' ? "ضعيف للغاية" : "Weak Pitch Level")}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Sign Up Specific Game preference Selection */}
          {activeTab === 'signup' && (
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-400 tracking-wide">{t.favGameLabel}</label>
              <input
                type="text"
                placeholder="FC25, eFootball 2026, PES 21"
                value={favGame}
                onChange={(e) => setFavGame(e.target.value)}
                className="w-full bg-slate-900/60 border-2 border-slate-800/80 rounded-xl py-2.5 px-4 outline-none font-bold text-slate-100 focus:border-violet-600 transition-all"
              />
            </div>
          )}

          {/* Action Trigger Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full relative overflow-hidden bg-gradient-to-r from-violet-600 to-emerald-500 text-white font-extrabold py-3.5 px-4 rounded-xl hover:opacity-95 transition-all duration-300 shadow-lg shadow-violet-950/20 active:scale-[0.99] disabled:opacity-50 text-xs uppercase tracking-wider select-none cursor-pointer"
          >
            <span className="flex items-center justify-center gap-2">
              <span>{activeTab === 'login' ? t.loginBtn : t.signupBtn}</span>
            </span>
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex py-1 items-center z-10">
          <div className="flex-grow border-t border-slate-800/60"></div>
          <span className="flex-shrink mx-4 text-slate-500 text-[10px] font-extrabold uppercase tracking-widest whitespace-nowrap">
            {t.orConnect}
          </span>
          <div className="flex-grow border-t border-slate-800/60"></div>
        </div>

        {/* Social Authentication Providers with Google and Locked Platforms */}
        <div className="space-y-2.5 relative z-10">
          {/* Active Google Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-900 font-black py-2.5 px-4 rounded-xl border border-slate-200 transition-all text-xs shadow-md active:scale-[0.99] disabled:opacity-50 cursor-pointer select-none"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            <span>{t.googleBtn}</span>
          </button>

          {/* Locked Apple & FB Slots directly addressing user intent */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled
              title={t.applePrompt}
              className="relative flex items-center justify-center gap-1.5 bg-slate-950/50 border border-slate-900/90 text-slate-500 font-bold py-2.5 px-3 rounded-xl text-[10px] cursor-not-allowed opacity-50 select-none"
            >
              <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.152 6.896c-.448 0-1.258-.507-2.207-.507-1.242 0-2.38.711-3.018 1.821-1.288 2.237-.329 5.548.917 7.35.61.88 1.334 1.861 2.22 1.825.91-.036 1.254-.588 2.355-.588 1.091 0 1.405.588 2.355.57 1 .018 1.614-.881 2.22-1.782.7-.991.986-1.953 1.004-2.007-.023-.009-1.916-.735-1.936-2.923-.018-1.83 1.488-2.709 1.558-2.754-.852-1.258-2.181-1.397-2.641-1.428-1.127-.091-2.176.696-2.697.696zm2.39-1.983c.478-.582.8-1.391.711-2.193-.69.027-1.528.46-2.023 1.042-.424.492-.794 1.314-.694 2.107.77.06 1.527-.373 2.006-.956z"/>
              </svg>
              <span className="truncate">{t.applePrompt}</span>
            </button>

            <button
              type="button"
              disabled
              title={t.fbPrompt}
              className="relative flex items-center justify-center gap-1.5 bg-slate-950/50 border border-slate-900/90 text-slate-500 font-bold py-2.5 px-3 rounded-xl text-[10px] cursor-not-allowed opacity-50 select-none"
            >
              <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
              </svg>
              <span className="truncate">{t.fbPrompt}</span>
            </button>
          </div>
        </div>

        {/* Footer info lock stamp */}
        <div className="pt-3 border-t border-slate-800/60 text-center relative z-10">
          <p className="text-[10px] text-slate-500 font-extrabold tracking-wide uppercase">
            {lang === 'ar' ? "تكتيك بوس AI © جميع الحقوق السحابية محفوظة" : "Tactic Boss AI © All cloud rights reserved"}
          </p>
        </div>

      </div>

      {/* High-Tech Soccer Coaching Loading Overlay / Tactical Simulation */}
      {isLoading && (
        <div className="fixed inset-0 z-50 bg-[#04080e]/95 flex flex-col items-center justify-center p-6 backdrop-blur-md animate-fade-in">
          
          {/* Animated football field tactical chalk simulation */}
          <div className="relative w-72 h-44 border border-emerald-500/20 bg-slate-950/80 rounded-2xl p-4 overflow-hidden shadow-[0_0_50px_rgba(16,185,129,0.15)] flex flex-col justify-between mb-8">
            
            {/* Field markers */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] bg-emerald-500/10 pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border border-emerald-500/10 pointer-events-none" />
            
            {/* Holographic grid scanner line */}
            <div className="absolute inset-x-0 h-[2px] bg-emerald-400/30 blur-sm shadow-emerald-400 animate-[sweep-light_2.5s_infinite_ease-in-out]" />

            {/* Tactical animated nodes representing team vectors drawing runs */}
            <div className="absolute top-1/3 left-1/4 w-3.5 h-3.5 rounded-full bg-violet-600 border border-white flex items-center justify-center text-[7px] text-white font-black animate-pulse">
              X
            </div>
            
            <div className="absolute top-2/3 right-1/4 w-3.5 h-3.5 rounded-full bg-emerald-500 border border-white flex items-center justify-center text-[7px] text-white font-black animate-ping">
              O
            </div>
            
            {/* Simulated run arrow path with glowing vector dot */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
              <path d="M 72, 70 Q 144, 30 216, 110" fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray="5,5" />
            </svg>
            
            <div className="absolute top-1/3 left-1/2 text-white font-mono text-[9px] bg-slate-900 border border-white/5 py-0.5 px-1.5 rounded animate-bounce">
              ⚽ METAFRAME SYNC
            </div>

            <div className="flex justify-between items-center text-[9px] text-slate-500 font-mono">
              <span>SCANNER: ACTIVE</span>
              <span>GPS PORT: 3000</span>
            </div>
          </div>

          {/* Loader Spinner */}
          <div className="relative flex items-center justify-center mb-4">
            <div className="w-14 h-14 border-4 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin" />
            <div className="absolute w-8 h-8 border-4 border-violet-500/10 border-t-violet-400 rounded-full animate-spin duration-1000" />
          </div>

          {/* Sliding slangs text rotating above */}
          <div className="text-center space-y-2 max-w-[320px]">
            <h3 className="text-sm font-black text-white tracking-wide animate-pulse">
              {lang === 'ar' ? "جاري تهيئة منظومة الذكاء الاصطناعي..." : "Configuring AI Tactical Engines..."}
            </h3>
            <p className="text-xs text-slate-400 font-medium h-8 animate-fade-in">
              {loadingSteps[loadingStep]}
            </p>
          </div>
          
          {/* Bottom Progress status bar indicator */}
          <div className="w-48 bg-slate-900 border border-white/5 rounded-full h-1.5 overflow-hidden mt-6">
            <div 
              className="bg-gradient-to-r from-violet-600 to-emerald-400 h-full transition-all duration-300"
              style={{ width: `${((loadingStep + 1) / loadingSteps.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Styled inject animations to guarantee rendering perfectly in preview frames */}
      <style>{`
        @keyframes sweep-light {
          0% { transform: rotate(-25deg) translateX(-10%); opacity: 0.1; }
          100% { transform: rotate(20deg) translateX(10%); opacity: 0.3; }
        }
        @keyframes sweep-right-light {
          0% { transform: rotate(25deg) translateX(10%); opacity: 0.05; }
          100% { transform: rotate(-20deg) translateX(-10%); opacity: 0.25; }
        }
      `}</style>
    </div>
  );
}
