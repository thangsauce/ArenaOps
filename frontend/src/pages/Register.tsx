import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Zap, User, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name || !email || !password || !confirmPass) {
      setError("Please fill in all fields.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPass) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate("/dashboard");
    }, 900);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-arena-bg font-sans text-gray-100 overflow-hidden">
      {/* Left Panel */}
      <div className="hidden md:flex md:w-5/12 lg:w-1/2 relative p-12 flex-col justify-center overflow-hidden border-r border-arena-border bg-[#0d0d14]">
        {/* Decorative Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-arena-accent/5 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-md mx-auto">
          <Link
            to="/"
            className="inline-flex items-center gap-2 mb-16 hover:opacity-80 transition-opacity"
          >
            <div className="p-2 bg-arena-accent/10 rounded-lg text-arena-accent">
              <Zap size={22} className="fill-current" />
            </div>
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
            Built for clubs,
            <br />
            built for game day.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg text-gray-400 mb-10 leading-relaxed"
          >
            Join hundreds of university esports clubs running smoother events
            with ArenaOPS.
          </motion.p>

          <motion.ul
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-4"
          >
            {[
              "Made for university clubs — no credit card needed",
              "Get set up in under 5 minutes",
              "Invite your whole organizer team",
              "Run unlimited tournaments",
            ].map((text, i) => (
              <li
                key={i}
                className="flex items-center gap-3 text-gray-300 font-medium"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-arena-accent flex-shrink-0 shadow-[0_0_8px_rgba(232,255,71,0.8)]" />
                {text}
              </li>
            ))}
          </motion.ul>
        </div>
      </div>

      {/* Right Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative">
        <div className="absolute right-0 top-0 w-[400px] h-[400px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md my-auto pb-10"
        >
          {/* Mobile Logo */}
          <Link
            to="/"
            className="flex md:hidden items-center gap-2 mb-10 justify-center"
          >
            <div className="p-2 bg-arena-accent/10 rounded-lg text-arena-accent">
              <Zap size={22} className="fill-current" />
            </div>
            <span className="font-display tracking-wide text-2xl font-bold">
              ArenaOPS
            </span>
          </Link>

          <div className="mb-8 text-center md:text-left">
            <h1 className="font-display text-4xl font-bold uppercase tracking-tight mb-2">
              Create account
            </h1>
            <p className="text-gray-400">Start managing tournaments</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2 flex flex-col items-start w-full">
              <label
                className="text-sm font-semibold text-gray-300 ml-1"
                htmlFor="name"
              >
                Full name
              </label>
              <div className="relative flex items-center w-full">
                <User
                  size={18}
                  className="absolute left-4 text-gray-500 pointer-events-none"
                />
                <input
                  id="name"
                  type="text"
                  className="w-full bg-arena-surface/80 border border-arena-border rounded-xl py-3 pl-11 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-arena-accent/50 focus:ring-1 focus:ring-arena-accent/50 transition-all font-medium"
                  placeholder="Alex Johnson"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                />
              </div>
            </div>

            <div className="space-y-2 flex flex-col items-start w-full">
              <label
                className="text-sm font-semibold text-gray-300 ml-1"
                htmlFor="email"
              >
                University email
              </label>
              <div className="relative flex items-center w-full">
                <Mail
                  size={18}
                  className="absolute left-4 text-gray-500 pointer-events-none"
                />
                <input
                  id="email"
                  type="email"
                  className="w-full bg-arena-surface/80 border border-arena-border rounded-xl py-3 pl-11 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-arena-accent/50 focus:ring-1 focus:ring-arena-accent/50 transition-all font-medium"
                  placeholder="you@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full">
              <div className="space-y-2 flex flex-col items-start w-full">
                <label
                  className="text-sm font-semibold text-gray-300 ml-1"
                  htmlFor="password"
                >
                  Password
                </label>
                <div className="relative flex items-center w-full">
                  <Lock
                    size={18}
                    className="absolute left-4 z-10 text-gray-500 pointer-events-none"
                  />
                  <input
                    id="password"
                    type={showPass ? "text" : "password"}
                    className="w-full bg-arena-surface/80 border border-arena-border rounded-xl py-3 pl-11 pr-10 text-white placeholder-gray-600 focus:outline-none focus:border-arena-accent/50 focus:ring-1 focus:ring-arena-accent/50 transition-all font-medium text-sm"
                    placeholder="Min. 8 chars"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 text-gray-500 hover:text-gray-300 transition-colors z-10"
                    onClick={() => setShowPass((v) => !v)}
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2 flex flex-col items-start w-full">
                <label
                  className="text-sm font-semibold text-gray-300 ml-1"
                  htmlFor="confirmPass"
                >
                  Confirm
                </label>
                <div className="relative flex items-center w-full">
                  <Lock
                    size={18}
                    className="absolute left-4 text-gray-500 pointer-events-none z-10"
                  />
                  <input
                    id="confirmPass"
                    type={showPass ? "text" : "password"}
                    className="w-full bg-arena-surface/80 border border-arena-border rounded-xl py-3 pl-11 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-arena-accent/50 focus:ring-1 focus:ring-arena-accent/50 transition-all font-medium text-sm"
                    placeholder="Repeat"
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                    autoComplete="new-password"
                  />
                </div>
              </div>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm font-medium text-red-400 bg-red-400/10 border border-red-400/20 py-2 px-3 rounded-lg text-center mt-2"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 group mt-6 py-4 bg-arena-accent hover:bg-[#dfff00] text-arena-bg font-bold rounded-xl text-lg shadow-[0_0_20px_rgba(232,255,71,0.15)] hover:shadow-[0_0_30px_rgba(232,255,71,0.3)] transition-all active:scale-95 disabled:opacity-70 disabled:pointer-events-none"
              disabled={loading}
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-arena-bg border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Create account{" "}
                  <ArrowRight
                    size={20}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </>
              )}
            </button>
            <p className="text-xs text-gray-500 text-center leading-relaxed mt-4">
              By creating an account you agree to our <br />
              <span className="text-gray-400 hover:text-white cursor-pointer transition-colors">
                Terms of Service
              </span>{" "}
              and{" "}
              <span className="text-gray-400 hover:text-white cursor-pointer transition-colors">
                Privacy Policy
              </span>
              .
            </p>
          </form>

          <p className="mt-8 text-center text-gray-400 font-medium text-sm">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-arena-accent hover:text-white transition-colors font-bold ml-1"
            >
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
