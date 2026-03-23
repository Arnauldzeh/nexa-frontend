"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Simulation d'une requête API (1.5s)
        setTimeout(() => {
            // Pour le test : user "admin" passe, sinon erreur
            if (email === "admin@edc.cm" || password === "admin") {
                console.log("Connexion réussie");
                router.push("/dashboard");
            } else {
                setError("Email ou mot de passe incorrect");
                setLoading(false);
            }
        }, 1500);
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8 font-sans">

            {/* Container principal (Carte blanche shadow-xl) */}
            <div className="w-full max-w-md space-y-8 bg-white p-10 shadow-xl rounded-2xl border border-gray-100">

                {/* En-tête avec Logo et Titre */}
                <div className="flex flex-col items-center text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-200">
                        {/* Logo EDC stylisé (4 carrés) */}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="28"
                            height="28"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <rect x="3" y="3" width="7" height="7" rx="1" />
                            <rect x="14" y="3" width="7" height="7" rx="1" />
                            <rect x="14" y="14" width="7" height="7" rx="1" />
                            <rect x="3" y="14" width="7" height="7" rx="1" />
                        </svg>
                    </div>
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900 tracking-tight">
                        Connexion
                    </h2>
                    <p className="mt-2 text-sm text-gray-500">
                        Bienvenue sur le portail EDC. Connectez-vous pour continuer.
                    </p>
                </div>

                {/* Message d'erreur global (similaire à ErrorState.png) */}
                {error && (
                    <div className="rounded-md bg-red-50 p-4 border border-red-200 flex items-start animate-in fade-in slide-in-from-top-2 duration-300">
                        <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                        <div className="flex-1">
                            <h3 className="text-sm font-medium text-red-800">Échec de connexion</h3>
                            <p className="text-sm text-red-700 mt-1">{error}</p>
                        </div>
                    </div>
                )}

                {/* Formulaire */}
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-5">

                        {/* Champ Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1 ml-1">
                                Adresse Email
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    placeholder="nom@edc.cm"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={`pl-10 ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50' : ''}`}
                                // Note: Input gère déjà leftIcon si on veut, mais ici on le fait manuellement pour contrôle total du style
                                />
                            </div>
                        </div>

                        {/* Champ Mot de passe */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1 ml-1">
                                Mot de passe
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    required
                                    placeholder="••••••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={`pl-10 pr-10 ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50' : ''}`}
                                />

                                {/* Bouton oeil / erreur à droite */}
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                    {error ? (
                                        <AlertCircle className="h-5 w-5 text-red-500" />
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="focus:outline-none text-gray-400 hover:text-gray-600 transition-colors"
                                            tabIndex={-1}
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-5 w-5" />
                                            ) : (
                                                <Eye className="h-5 w-5" />
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Checkbox Se souvenir de moi + Mdp oublié */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 cursor-pointer select-none">
                                Se souvenir de moi
                            </label>
                        </div>

                        <div className="text-sm">
                            <a href="#" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                                Mot de passe oublié ?
                            </a>
                        </div>
                    </div>

                    {/* Bouton Connexion */}
                    <Button
                        type="submit"
                        className="w-full h-11 text-base shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                        disabled={loading}
                        loading={loading}
                    >
                        {loading ? "Connexion en cours..." : "Accéder à mon espace"}
                    </Button>

                </form>
            </div>

            {/* Footer minimaliste */}
            <footer className="absolute bottom-6 w-full text-center">
                <p className="text-xs text-gray-400">
                    © 2026 Electricity Development Corporation.
                </p>
            </footer>
        </div>
    );
}
