import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiBriefcase,
  FiUser,
  FiUsers,
} from "react-icons/fi";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [role, setRole] = useState("candidate");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    companyName: "",
    sector: "",
    address: "",
    website: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    if (formData.password.length < 8) {
      setError(
        "Le mot de passe doit contenir au moins 8 caractères."
      );
      return;
    }

    if (
      formData.password !==
      formData.confirmPassword
    ) {
      setError(
        "Les deux mots de passe ne correspondent pas."
      );
      return;
    }

    if (
      role === "company" &&
      !formData.companyName.trim()
    ) {
      setError(
        "Le nom de l’entreprise est obligatoire."
      );
      return;
    }

    try {
      setLoading(true);

      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
        role,
      };

      if (role === "company") {
        payload.companyName =
          formData.companyName.trim();

        payload.sector =
          formData.sector.trim();

        payload.address =
          formData.address.trim();

        payload.website =
          formData.website.trim();
      }

      const response = await api.post(
        "/auth/register",
        payload
      );

      const { token, user } = response.data;

      if (!token || !user) {
        throw new Error(
          "Réponse invalide reçue depuis le serveur."
        );
      }

      login(user, token);

      if (user.role === "candidate") {
        navigate("/candidate/dashboard");
      } else if (user.role === "company") {
        navigate("/company/dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error(
        "Erreur inscription :",
        err
      );

      setError(
        err.response?.data?.message ||
          err.message ||
          "Impossible de créer le compte."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto flex min-h-[80vh] max-w-7xl items-center justify-center px-6 py-16">
      <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">

        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white">
            <FiBriefcase size={26} />
          </div>

          <h1 className="mt-5 text-3xl font-bold text-slate-900">
            Créer un compte DjibJob
          </h1>

          <p className="mt-3 text-slate-600">
            Inscrivez-vous comme candidat ou entreprise.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() =>
              setRole("candidate")
            }
            className={
              role === "candidate"
                ? "flex items-center justify-center gap-2 rounded-xl border-2 border-blue-600 bg-blue-50 px-4 py-3 font-semibold text-blue-700"
                : "flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-3 font-semibold text-slate-600 hover:bg-slate-50"
            }
          >
            <FiUser />
            Candidat
          </button>

          <button
            type="button"
            onClick={() =>
              setRole("company")
            }
            className={
              role === "company"
                ? "flex items-center justify-center gap-2 rounded-xl border-2 border-blue-600 bg-blue-50 px-4 py-3 font-semibold text-blue-700"
                : "flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-3 font-semibold text-slate-600 hover:bg-slate-50"
            }
          >
            <FiUsers />
            Entreprise
          </button>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-6"
        >
          <div className="grid gap-6 md:grid-cols-2">

            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Nom complet *
              </label>

              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Votre nom"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Téléphone
              </label>

              <input
                id="phone"
                name="phone"
                type="text"
                value={formData.phone}
                onChange={handleChange}
                placeholder="77 12 34 56"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Adresse e-mail *
              </label>

              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="exemple@email.com"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Mot de passe *
              </label>

              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="8 caractères minimum"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Confirmer le mot de passe *
              </label>

              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Retapez le mot de passe"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

          </div>

          {role === "company" && (
            <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-6">
              <h2 className="text-lg font-bold text-slate-900">
                Informations de l’entreprise
              </h2>

              <div className="mt-5 grid gap-5 md:grid-cols-2">

                <div className="md:col-span-2">
                  <label
                    htmlFor="companyName"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Nom de l’entreprise *
                  </label>

                  <input
                    id="companyName"
                    name="companyName"
                    type="text"
                    value={formData.companyName}
                    onChange={handleChange}
                    required={role === "company"}
                    placeholder="Ex. DjibJob Telecom"
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="sector"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Secteur
                  </label>

                  <input
                    id="sector"
                    name="sector"
                    type="text"
                    value={formData.sector}
                    onChange={handleChange}
                    placeholder="Ex. Télécommunications"
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="address"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Adresse
                  </label>

                  <input
                    id="address"
                    name="address"
                    type="text"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Djibouti-ville"
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="website"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Site web
                  </label>

                  <input
                    id="website"
                    name="website"
                    type="url"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://..."
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>

              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Création du compte..."
              : role === "candidate"
                ? "Créer mon compte candidat"
                : "Créer mon compte entreprise"}
          </button>
        </form>

        <p className="mt-7 text-center text-sm text-slate-600">
          Vous avez déjà un compte ?{" "}
          <Link
            to="/login"
            className="font-semibold text-blue-600 hover:text-blue-700"
          >
            Se connecter
          </Link>
        </p>

      </div>
    </section>
  );
}

export default Register;