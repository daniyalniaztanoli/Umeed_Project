import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FiMail, FiLock, FiEye, FiEyeOff, FiAlertCircle, FiLoader } from 'react-icons/fi';
import logo from '../assets/logo.png';

const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

/* ── Animated Sprout SVG — matches the actual logo ── */
const SproutLogo = ({ size = 32, animate = false, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#22C55E" />
        <stop offset="100%" stopColor="#0F9B87" />
      </linearGradient>
      {animate && (
        <style>{`
          .stem {
            stroke-dasharray: 42;
            stroke-dashoffset: 42;
            animation: stemDraw 0.55s cubic-bezier(0.4,0,0.2,1) 0.15s forwards;
          }
          .leaf-white {
            transform-origin: 46px 62px;
            transform: scale(0) rotate(-50deg);
            opacity: 0;
            animation: leafOpen 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.65s forwards;
          }
          .leaf-yellow {
            transform-origin: 54px 52px;
            transform: scale(0) rotate(50deg);
            opacity: 0;
            animation: leafOpen 0.6s cubic-bezier(0.34,1.56,0.64,1) 1.0s forwards;
          }
          @keyframes stemDraw {
            to { stroke-dashoffset: 0; }
          }
          @keyframes leafOpen {
            to { transform: scale(1) rotate(0deg); opacity: 1; }
          }
        `}</style>
      )}
    </defs>

    {/* rounded square background */}
    <rect width="100" height="100" rx="22" fill="url(#bgGrad)" />

    {/* stem — grows from bottom-center upward */}
    <path
      className={animate ? 'stem' : ''}
      d="M50 78 C50 78 50 58 50 44"
      stroke="white"
      strokeWidth="5"
      strokeLinecap="round"
    />

    {/* white leaf — curves left from stem */}
    <path
      className={animate ? 'leaf-white' : ''}
      d="M50 62 C50 62 32 56 28 38 C28 38 46 36 50 62Z"
      fill="white"
    />

    {/* yellow leaf — curves right-upward from stem */}
    <path
      className={animate ? 'leaf-yellow' : ''}
      d="M50 52 C50 52 66 44 72 26 C72 26 56 24 50 52Z"
      fill="#FDE68A"
    />
  </svg>
);

/* ── Input field component ── */
const Field = ({ id, label, error, icon: Icon, rightSlot, ...props }) => (
  <div className="flex flex-col gap-1.5">
    <label htmlFor={id} className="text-sm font-semibold text-gray-700">
      {label}
    </label>
    <div className="relative group">
      <Icon
        size={17}
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors duration-200 pointer-events-none"
      />
      <input
        id={id}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-err` : undefined}
        className={`
          w-full pl-10 py-3 text-sm rounded-xl border bg-gray-50
          text-gray-800 placeholder:text-gray-400
          transition-all duration-200
          focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/30 focus:border-primary
          ${rightSlot ? 'pr-11' : 'pr-4'}
          ${error ? 'border-red-400 bg-red-50 focus:ring-red-200 focus:border-red-400' : 'border-gray-200'}
        `}
        {...props}
      />
      {rightSlot && (
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2">{rightSlot}</div>
      )}
    </div>
    {error && (
      <p id={`${id}-err`} role="alert" className="flex items-center gap-1.5 text-xs text-red-500 font-medium">
        <FiAlertCircle size={12} /> {error}
      </p>
    )}
  </div>
);

/* ══════════════════════════════════════════
   MAIN LOGIN PAGE
══════════════════════════════════════════ */
const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate  = useNavigate();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [errors,   setErrors]   = useState({ email: '', password: '' });

  const validate = () => {
    const e = { email: '', password: '' };
    if (!email)               e.email    = 'Email is required.';
    else if (!isValidEmail(email)) e.email = 'Enter a valid email.';
    if (!password)            e.password = 'Password is required.';
    else if (password.length < 6) e.password = 'Minimum 6 characters.';
    setErrors(e);
    return !e.email && !e.password;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const ok = await login(email, password);
    setLoading(false);
    if (ok) navigate('/dashboard');
  };

  const clearErr = (field) => setErrors(p => ({ ...p, [field]: '' }));

  return (
    <div className="min-h-screen flex flex-col lg:flex-row font-sans">

      {/* ════════════════════════════════
          LEFT — brand panel (lg+)
      ════════════════════════════════ */}
      <div className="hidden lg:flex lg:w-[52%] xl:w-1/2 relative overflow-hidden bg-brand-gradient flex-col items-center justify-center p-14">

        {/* background blobs */}
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-20 w-96 h-96 rounded-full bg-white/10 blur-3xl" />

        {/* yellow leaf shapes — floating with animation */}
        <div className="absolute top-[28%] right-10 w-36 h-52 opacity-[0.18] rotate-[22deg] animate-[leafFloat_6s_ease-in-out_infinite]"
          style={{ background: '#FDE68A', borderRadius: '60% 40% 70% 30% / 50% 60% 40% 50%' }} />
        <div className="absolute bottom-28 left-14 w-20 h-32 opacity-[0.12] -rotate-[18deg] animate-[leafFloat_8s_ease-in-out_1s_infinite]"
          style={{ background: '#FDE68A', borderRadius: '60% 40% 70% 30% / 50% 60% 40% 50%' }} />
        <div className="absolute top-16 right-1/3 w-10 h-16 opacity-[0.10] rotate-[40deg] animate-[leafFloat_7s_ease-in-out_2s_infinite]"
          style={{ background: '#FDE68A', borderRadius: '60% 40% 70% 30% / 50% 60% 40% 50%' }} />

        {/* content */}
        <div className="relative z-10 max-w-xs text-center flex flex-col items-center gap-7">

          {/* logo box */}
          <div className="w-24 h-24 rounded-[2rem] bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-soft animate-[logoPop_0.5s_cubic-bezier(0.34,1.56,0.64,1)_0.1s_both]">
            <SproutLogo size={52} animate />
          </div>

          {/* yellow badge */}
          <span className="inline-flex items-center gap-2 bg-secondary text-ink text-xs font-bold px-4 py-1.5 rounded-full shadow-sm animate-[fadeUp_0.5s_ease_0.5s_both]">
            🌱 Umeed
          </span>

          <div className="space-y-3 animate-[fadeUp_0.5s_ease_0.65s_both]">
            <h1 className="text-4xl font-extrabold text-white leading-tight tracking-tight">
              Welcome back
            </h1>
            <p className="text-white/70 text-[15px] leading-relaxed">
              Manage campaigns, track donations,<br />and grow your impact.
            </p>
          </div>

          {/* decorative stat pills */}
          <div className="flex gap-3 mt-2 animate-[fadeUp_0.5s_ease_0.8s_both]">
            {[['🎯', 'Campaigns'], ['💚', 'Donations'], ['📊', 'Reports']].map(([icon, label]) => (
              <div key={label} className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1.5 text-white text-xs font-medium hover:bg-white/25 transition-colors duration-200">
                <span>{icon}</span> {label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════
          RIGHT — form panel
      ════════════════════════════════ */}
      <div className="flex-1 flex flex-col bg-[#F8FFFE] min-h-screen lg:min-h-0">

        {/* mobile header */}
        <div className="lg:hidden bg-brand-gradient px-6 pt-10 pb-14 flex flex-col items-center gap-3 relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-white/10 blur-2xl" />
          <div className="w-16 h-16 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center animate-[logoPop_0.5s_cubic-bezier(0.34,1.56,0.64,1)_0.1s_both]">
            <SproutLogo size={36} animate />
          </div>
          <p className="text-white font-bold text-lg">Umeed</p>
          <p className="text-white/70 text-xs tracking-wide uppercase">Admin Panel</p>
        </div>

        {/* card wrapper */}
        <div className="flex-1 flex items-start lg:items-center justify-center px-4 py-6 lg:p-10">
          <div
            className="
              w-full max-w-[420px]
              bg-white rounded-3xl
              border border-primary-light
              shadow-soft
              p-7 sm:p-9
              -mt-8 lg:mt-0
              animate-[slideUp_0.45s_cubic-bezier(0.16,1,0.3,1)_both]
            "
          >

            {/* card top */}
            <div className="flex flex-col items-center gap-2 mb-7">
              <div className="hidden lg:flex w-14 h-14 rounded-2xl bg-brand-gradient items-center justify-center shadow-soft mb-1 animate-[logoPop_0.5s_cubic-bezier(0.34,1.56,0.64,1)_0.3s_both]">
                <SproutLogo size={30} animate />
              </div>
              <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Sign in</h2>
              <p className="text-sm text-gray-400">Enter your admin credentials to continue</p>
            </div>

            {/* form */}
            <form onSubmit={handleSubmit} noValidate className="space-y-4">

              <Field
                id="email"
                label="Email address"
                type="email"
                placeholder="admin@umeed.org"
                autoComplete="email"
                value={email}
                onChange={e => { setEmail(e.target.value); clearErr('email'); }}
                icon={FiMail}
                error={errors.email}
              />

              <Field
                id="password"
                label="Password"
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                autoComplete="current-password"
                value={password}
                onChange={e => { setPassword(e.target.value); clearErr('password'); }}
                icon={FiLock}
                error={errors.password}
                rightSlot={
                  <button
                    type="button"
                    onClick={() => setShowPass(s => !s)}
                    aria-label={showPass ? 'Hide password' : 'Show password'}
                    className="text-gray-400 hover:text-primary transition-colors duration-200 focus:outline-none"
                  >
                    {showPass ? <FiEyeOff size={17} /> : <FiEye size={17} />}
                  </button>
                }
              />

              {/* submit */}
              <button
                type="submit"
                disabled={loading}
                className="
                  relative w-full mt-1 py-3 rounded-2xl
                  bg-brand-gradient text-white text-sm font-bold
                  shadow-soft tracking-wide
                  flex items-center justify-center gap-2
                  hover:-translate-y-0.5 hover:shadow-lg
                  active:scale-[0.98]
                  transition-all duration-200
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
                  disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0
                "
              >
                {loading
                  ? <><FiLoader size={16} className="animate-spin" /> Signing in…</>
                  : 'Sign In →'
                }
              </button>
            </form>

            {/* divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-[11px] text-gray-400 font-medium uppercase tracking-widest">or</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            {/* info note */}
            <div className="flex items-start gap-3 bg-primary-light rounded-2xl px-4 py-3">
              <span className="text-lg mt-0.5">🔒</span>
              <p className="text-xs text-primary-dark leading-relaxed">
                This panel is restricted to <strong>admin</strong> and <strong>finance officer</strong> accounts only.
              </p>
            </div>

            {/* footer */}
            <p className="text-center text-[11px] text-gray-400 mt-6">
              Umeed © {new Date().getFullYear()} · All rights reserved
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

