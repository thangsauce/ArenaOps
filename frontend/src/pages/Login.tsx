import { useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import BrandLogo from "../components/BrandLogo";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { motion } from "framer-motion";

export default function Login() {
  const navigate = useNavigate();
  const passwordRef = useRef<HTMLInputElement | null>(null);
  const signInRef = useRef<HTMLButtonElement | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate("/dashboard");
    }, 800);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-arena-bg font-sans text-arena-text overflow-hidden">
      {/* Left Panel */}
      <div className="hidden md:flex md:w-5/12 lg:w-1/2 relative p-12 flex-col justify-center overflow-hidden border-r border-arena-border bg-[#0d0d14]">
        {/* Decorative Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 bg-arena-accent/5 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-md mx-auto">
          <Link
            to="/"
            className="inline-flex items-center gap-2 mb-16 hover:opacity-80 transition-opacity"
          >
            <BrandLogo size={36} />
            <span className="font-display tracking-wide text-3xl font-bold">
              ArenaOPS
            </span>
          </Link>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-display text-5xl lg:text-6xl font-black uppercase leading-[0.9] tracking-tight mb-6"
          >
            Your arena awaits.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg text-gray-400 mb-10 leading-relaxed"
          >
            Manage tournaments, track matches live, and run events your club
            will remember.
          </motion.p>

          <motion.ul
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-4"
          >
            {[
              "Live match control & real-time scoring",
              "Automated scheduling & availability collection",
              "Room booking & venue management",
              "Participant tracking & bracket generation",
            ].map((text, i) => (
              <li
                key={i}
                className="flex items-center gap-3 text-gray-300 font-medium"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-arena-accent shrink-0 shadow-[0_0_8px_rgba(232,255,71,0.8)]" />
                {text}
              </li>
            ))}
          </motion.ul>
        </div>
      </div>

      {/* Right Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative">
        <div className="absolute right-0 top-0 w-100 h-100 bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

        {/* Home Button */}
        <button
          onClick={() => navigate("/")}
          className="absolute top-6 left-6 sm:top-8 sm:left-8 flex items-center gap-2 text-sm font-medium text-arena-text-muted hover:text-arena-text transition-colors z-10"
        >
          <ArrowLeft size={16} />
          Home
        </button>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <Link
            to="/"
            className="flex md:hidden items-center gap-2 mb-12 justify-center"
          >
            <BrandLogo size={32} />
            <span className="font-display tracking-wide text-2xl font-bold">
              ArenaOPS
            </span>
          </Link>

          <div className="mb-10 text-center md:text-left">
            <h1 className="font-display text-4xl font-bold uppercase tracking-tight mb-2 text-arena-text">
              Welcome back
            </h1>
            <p className="text-arena-text-muted">Sign in to your ArenaOPS account</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label
                className="text-sm font-semibold text-arena-text ml-1"
                htmlFor="email"
              >
                Email
              </label>
              <div className="relative flex items-center">
                <Mail
                  size={18}
                  className="absolute left-4 text-arena-text-muted pointer-events-none"
                />
                <input
                  id="email"
                  type="email"
                  className="w-full bg-arena-surface/80 border border-arena-border rounded-xl py-3.5 pl-11 pr-4 text-arena-text placeholder:text-arena-text-muted focus:outline-none focus:border-arena-accent/50 focus:ring-1 focus:ring-arena-accent/50 transition-all font-medium"
                  placeholder="you@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key !== "Enter") return;
                    e.preventDefault();
                    passwordRef.current?.focus();
                  }}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label
                  className="text-sm font-semibold text-arena-text"
                  htmlFor="password"
                >
                  Password
                </label>
                <button
                  type="button"
                  className="text-xs font-semibold text-arena-accent hover:text-arena-text transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative flex items-center">
                <Lock
                  size={18}
                  className="absolute left-4 text-arena-text-muted pointer-events-none"
                />
                <input
                  ref={passwordRef}
                  id="password"
                  type={showPass ? "text" : "password"}
                  className="w-full bg-arena-surface/80 border border-arena-border rounded-xl py-3.5 pl-11 pr-12 text-arena-text placeholder:text-arena-text-muted focus:outline-none focus:border-arena-accent/50 focus:ring-1 focus:ring-arena-accent/50 transition-all font-medium"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key !== "Enter") return;
                    e.preventDefault();
                    signInRef.current?.focus();
                  }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute right-4 text-arena-text-muted hover:text-arena-text transition-colors"
                  onClick={() => setShowPass((v) => !v)}
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm font-medium text-red-400 bg-red-400/10 border border-red-400/20 py-2 px-3 rounded-lg text-center"
              >
                {error}
              </motion.p>
            )}

            <button
              ref={signInRef}
              type="submit"
              className="w-full flex items-center justify-center gap-2 group mt-2 py-4 bg-arena-accent hover:bg-arena-accent-hover text-arena-bg font-bold rounded-xl text-lg shadow-[0_0_20px_rgba(232,255,71,0.15)] hover:shadow-[0_0_30px_rgba(232,255,71,0.3)] transition-all active:scale-95 disabled:opacity-70 disabled:pointer-events-none"
              disabled={loading}
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-arena-bg border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Sign in{" "}
                  <ArrowRight
                    size={20}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-arena-text-muted font-medium text-sm">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-arena-accent hover:text-arena-text transition-colors font-bold ml-1"
            >
              Create one
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
