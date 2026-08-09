import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiSave,
  FiUser,
} from "react-icons/fi";

import api from "../services/api";

function CandidateProfile() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    professionalTitle: "",
    description: "",
    skills: "",
    education: "",
    experience: "",
    city: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/users/profile");

        const user = response.data.user || {};
        const profile = response.data.profile || {};

        setFormData({
          name: user.name || "",
          phone: user.phone || "",
          professionalTitle:
            profile.professional_title || "",
          description:
            profile.description || "",
          skills:
            profile.skills || "",
          education:
            profile.education || "",
          experience:
            profile.experience || "",
          city:
            profile.city || "",
        });
      } catch (err) {
        console.error(
          "Erreur récupération profil candidat :",
          err
        );

        setError(
          err.response?.data?.message ||
            "Impossible de récupérer votre profil."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await api.put(
        "/users/profile",
        {
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          professionalTitle:
            formData.professionalTitle.trim(),
          description:
            formData.description.trim(),
          skills:
            formData.skills.trim(),
          education:
            formData.education.trim(),
          experience:
            formData.experience.trim(),
          city:
            formData.city.trim(),
        }
      );

      setSuccess(
        response.data.message ||
          "Profil modifié avec succès."
      );
    } catch (err) {
      console.error(
        "Erreur modification profil candidat :",
        err
      );

      setError(
        err.response?.data?.message ||
          "Impossible de modifier votre profil."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <section className="mx-auto max-w-5xl px-6 py-12">
        <p className="text-lg text-slate-600">
          Chargement de votre profil...
        </p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-5xl px-6 py-12">
      <Link
        to="/candidate/dashboard"
        className="inline-flex items-center gap-2 font-semibold text-blue-600 hover:text-blue-700"
      >
        <FiArrowLeft />
        Retour au tableau de bord
      </Link>

      <div className="mt-7">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <FiUser size={28} />
        </div>

        <h1 className="mt-5 text-4xl font-bold text-slate-900">
          Mon profil
        </h1>

        <p className="mt-3 text-slate-600">
          Complétez vos informations pour améliorer
          votre visibilité auprès des recruteurs.
        </p>
      </div>

      {error && (
        <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700">
          {success}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="mt-10 space-y-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"
      >
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Nom complet
            </label>

            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
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
              placeholder="Ex. 77 12 34 56"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="professionalTitle"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Titre professionnel
            </label>

            <input
              id="professionalTitle"
              name="professionalTitle"
              type="text"
              value={formData.professionalTitle}
              onChange={handleChange}
              placeholder="Ex. Développeur Full Stack"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="city"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Ville
            </label>

            <input
              id="city"
              name="city"
              type="text"
              value={formData.city}
              onChange={handleChange}
              placeholder="Ex. Djibouti-ville"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="description"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Présentation
          </label>

          <textarea
            id="description"
            name="description"
            rows="5"
            value={formData.description}
            onChange={handleChange}
            placeholder="Présentez brièvement votre profil..."
            className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor="skills"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Compétences
          </label>

          <textarea
            id="skills"
            name="skills"
            rows="4"
            value={formData.skills}
            onChange={handleChange}
            placeholder="Ex. React, Node.js, MySQL, Git..."
            className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor="education"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Formation
          </label>

          <textarea
            id="education"
            name="education"
            rows="4"
            value={formData.education}
            onChange={handleChange}
            placeholder="Ex. Licence Informatique, Université de Djibouti"
            className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor="experience"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Expérience
          </label>

          <textarea
            id="experience"
            name="experience"
            rows="4"
            value={formData.experience}
            onChange={handleChange}
            placeholder="Décrivez vos projets, stages ou expériences..."
            className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex justify-end border-t border-slate-200 pt-7">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            <FiSave />

            {saving
              ? "Enregistrement..."
              : "Enregistrer les modifications"}
          </button>
        </div>
      </form>
    </section>
  );
}

export default CandidateProfile;