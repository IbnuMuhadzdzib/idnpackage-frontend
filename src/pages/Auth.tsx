import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ui/ThemeToggle';

function Auth() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        document.title = "Login - IDN Paketku";
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email.trim() || !password.trim()) {
            setErrorMsg('Email dan password wajib diisi.');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setErrorMsg('Format email tidak valid.');
            return;
        }

        setIsLoading(true);
        setErrorMsg('');

        const controller = new AbortController();
        // Set timeout 8 detik agar user tidak menunggu terlalu lama jika server Railway mati/tidur
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        try {
            const payload = { email, password };

            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth-v2/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            const data = await response.json();

            if (!data.success) {
                if (data.statusCode === 401 || data.message === 'Unauthorized' || data.message === 'Invalid credentials') {
                    throw new Error('Email atau password salah.');
                }
                throw new Error(data.message || 'Login gagal, periksa email & password.');
            }

            // Backend returns { success: true, data: { accessToken, userId, name, role } }
            const userData = data.data;
            localStorage.setItem('token', userData.accessToken);
            localStorage.setItem('user', JSON.stringify(userData));

            // Redirect berdasarkan role
            const userRole = userData.role;
            if (userRole === 'admin' || userRole === 'operator') {
                navigate('/operator');
            } else {
                navigate('/general');
            }
        } catch (error: any) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                setErrorMsg('Server merespons terlalu lama. Pastikan backend Anda aktif.');
            } else if (error.message === 'Failed to fetch') {
                setErrorMsg('Gagal terhubung ke server (Network Error).');
            } else {
                setErrorMsg(error.message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F6F7F9] dark:bg-slate-900 flex items-center justify-center p-4 transition-colors duration-300 font-jakarta">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md p-8">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-[#143C9C] dark:text-blue-400">
                        Selamat Datang Kembali!
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
                        Silakan masuk ke akun Anda.
                    </p>
                </div>

                {errorMsg && (
                    <div className="mb-6 flex items-center gap-3 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-300">
                        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span>{errorMsg}</span>
                    </div>
                )}

                <div className="absolute top-6 right-6">
                    <ThemeToggle />
                </div>

                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl 
                                bg-white text-gray-900 placeholder-gray-400
                                dark:bg-slate-800 dark:border-slate-600 dark:text-white dark:placeholder-gray-500
                                focus:ring-2 focus:ring-[#143C9C] outline-none transition-all"
                            placeholder="nama@email.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-xl bg-white text-gray-900 placeholder-gray-400 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-gray-500 focus:ring-2 focus:ring-[#143C9C] outline-none transition-all"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
                            >
                                {showPassword ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                )}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-[#143C9C] hover:bg-blue-800 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
                    >
                        {isLoading ? 'Memproses...' : 'Masuk'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Auth;
