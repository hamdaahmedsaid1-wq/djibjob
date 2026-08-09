import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      const response = await api.post("/auth/login", {
        email: formData.email.trim(),
        password: formData.password,
      });

      console.log("Réponse connexion :", response.data);

      const { token, user } = response.data;

      if (!token || !user) {
        throw new Error(
          "Réponse invalide reçue depuis le serveur."
        );
      }

      login(user, token);

      if (user.role === "admin") {
        navigate("/admin/dashboard");
      } else if (user.role === "company") {
        navigate("/company/dashboard");
      } else if (user.role === "candidate") {
        navigate("/candidate/dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error("Erreur connexion frontend :", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Impossible de se connecter."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto flex min-h-[75vh] max-w-7xl items-center justify-center px-6 py-16">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
        <p className="font-semibold text-blue-600">
          Bienvenue sur DjibJob
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Se connecter
        </h1>

        <p className="mt-3 text-slate-600">
          Accédez à votre espace candidat, entreprise ou administrateur.
        </p>

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-5"
        >
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Adresse e-mail
            </label>

            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
              placeholder="admin@djibjob.dj"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Mot de passe
            </label>

            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
              placeholder="Votre mot de passe"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Vous n’avez pas encore de compte ?{" "}
          <Link
            to="/register"
            className="font-semibold text-blue-600"
          >
            Créer un compte
          </Link>
        </p>
      </div>
    </section>
  );
}

export default Login;