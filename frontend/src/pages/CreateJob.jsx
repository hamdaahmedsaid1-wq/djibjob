import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiBriefcase,
  FiSave,
} from "react-icons/fi";

import api from "../services/api";

function CreateJob() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    categoryId: "",
    title: "",
    description: "",
    missions: "",
    requirements: "",
    experienceLevel: "",
    location: "",
    contractType: "CDI",
    salary: "",
    deadline: "",
    status: "active",
  });

  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] =
    useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function fetchCategories() {
      try {
        setCategoriesLoading(true);

        const response = await api.get("/jobs/categories");

        setCategories(
          response.data.categories || []
        );
      } catch (err) {
        console.error(
          "Erreur récupération catégories :",
          err
        );

        /*
          Si cette route n'existe pas encore,
          le formulaire continue quand même à fonctionner.
        */
        setCategories([]);
      } finally {
        setCategoriesLoading(false);
      }
    }

    fetchCategories();
  }, []);

  function handleChange(event) {
    const {
      name,
      value,
    } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const payload = {
        categoryId:
          formData.categoryId
            ? Number(formData.categoryId)
            : null,

        title: formData.title.trim(),

        description:
          formData.description.trim(),

        missions:
          formData.missions.trim(),

        requirements:
          formData.requirements.trim(),

        experienceLevel:
          formData.experienceLevel.trim(),

        location:
          formData.location.trim(),

        contractType:
          formData.contractType,

        salary:
          formData.salary
            ? Number(formData.salary)
            : null,

        deadline:
          formData.deadline || null,

        status:
          formData.status,
      };

      const response = await api.post(
        "/jobs",
        payload
      );

      setSuccess(
        response.data.message ||
          "Offre publiée avec succès."
      );

      setTimeout(() => {
        navigate("/company/jobs");
      }, 1200);
    } catch (err) {
      console.error(
        "Erreur création offre :",
        err
      );

      setError(
        err.response?.data?.message ||
          "Impossible de publier l’offre."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-5xl px-6 py-12">
      <Link
        to="/company/dashboard"
        className="inline-flex items-center gap-2 font-semibold text-blue-600 hover:text-blue-700"
      >
        <FiArrowLeft />
        Retour au tableau de bord
      </Link>

      <div className="mt-7">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <FiBriefcase size={28} />
        </div>

        <h1 className="mt-5 text-4xl font-bold text-slate-900">
          Publier une offre
        </h1>

        <p className="mt-3 text-slate-600">
          Remplissez les informations ci-dessous pour publier
          une nouvelle opportunité sur DjibJob.
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
          <div className="md:col-span-2">
            <label
              htmlFor="title"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Titre du poste *
            </label>

            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Ex. Développeur Full Stack"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div>
            <label
              htmlFor="categoryId"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Catégorie
            </label>

            <select
              id="categoryId"
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              disabled={categoriesLoading}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
            >
              <option value="">
                Sans catégorie
              </option>

              {categories.map((category) => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="contractType"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Type de contrat *
            </label>

            <select
              id="contractType"
              name="contractType"
              value={formData.contractType}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
            >
              <option value="CDI">CDI</option>
              <option value="CDD">CDD</option>
              <option value="Stage">Stage</option>
              <option value="Alternance">
                Alternance
              </option>
              <option value="Freelance">
                Freelance
              </option>
            </select>
          </div>

          <div>
            <label
              htmlFor="location"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Localisation *
            </label>

            <input
              id="location"
              name="location"
              type="text"
              value={formData.location}
              onChange={handleChange}
              required
              placeholder="Ex. Djibouti-ville"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="experienceLevel"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Niveau d’expérience
            </label>

            <input
              id="experienceLevel"
              name="experienceLevel"
              type="text"
              value={formData.experienceLevel}
              onChange={handleChange}
              placeholder="Ex. Débutant accepté"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="salary"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Salaire (DJF)
            </label>

            <input
              id="salary"
              name="salary"
              type="number"
              min="0"
              value={formData.salary}
              onChange={handleChange}
              placeholder="Ex. 180000"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="deadline"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Date limite
            </label>

            <input
              id="deadline"
              name="deadline"
              type="date"
              value={formData.deadline}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="status"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Statut
            </label>

            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
            >
              <option value="active">
                Publier immédiatement
              </option>

              <option value="draft">
                Enregistrer comme brouillon
              </option>
            </select>
          </div>
        </div>

        <div>
          <label
            htmlFor="description"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Description du poste *
          </label>

          <textarea
            id="description"
            name="description"
            rows="6"
            value={formData.description}
            onChange={handleChange}
            required
            placeholder="Présentez le poste et son contexte..."
            className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />
        </div>

        <div>
          <label
            htmlFor="missions"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Missions
          </label>

          <textarea
            id="missions"
            name="missions"
            rows="5"
            value={formData.missions}
            onChange={handleChange}
            placeholder="Décrivez les principales missions..."
            className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor="requirements"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Compétences et prérequis
          </label>

          <textarea
            id="requirements"
            name="requirements"
            rows="5"
            value={formData.requirements}
            onChange={handleChange}
            placeholder="Ex. React, Node.js, MySQL..."
            className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-7 sm:flex-row sm:justify-end">
          <Link
            to="/company/dashboard"
            className="rounded-xl border border-slate-300 px-6 py-3 text-center font-semibold text-slate-700 hover:bg-slate-100"
          >
            Annuler
          </Link>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FiSave />

            {loading
              ? "Publication..."
              : formData.status === "draft"
                ? "Enregistrer le brouillon"
                : "Publier l’offre"}
          </button>
        </div>
      </form>
    </section>
  );
}

export default CreateJob;