import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  FiArrowLeft,
  FiEdit2,
  FiSave,
} from "react-icons/fi";

import api from "../services/api";

function EditJob() {
  const { id } = useParams();
  const navigate = useNavigate();

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

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function fetchJob() {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/jobs/${id}`);
        const job = response.data.job;

        setFormData({
          categoryId: job.category_id || "",
          title: job.title || "",
          description: job.description || "",
          missions: job.missions || "",
          requirements: job.requirements || "",
          experienceLevel:
            job.experience_level || "",
          location: job.location || "",
          contractType:
            job.contract_type || "CDI",
          salary: job.salary || "",
          deadline: job.deadline
            ? job.deadline.slice(0, 10)
            : "",
          status: job.status || "active",
        });
      } catch (err) {
        console.error(
          "Erreur récupération offre :",
          err
        );

        setError(
          err.response?.data?.message ||
            "Impossible de récupérer cette offre."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchJob();
  }, [id]);

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

      const payload = {
        categoryId:
          formData.categoryId === ""
            ? null
            : Number(formData.categoryId),

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
          formData.salary === ""
            ? null
            : Number(formData.salary),
        deadline:
          formData.deadline || null,
        status:
          formData.status,
      };

      const response = await api.put(
        `/jobs/${id}`,
        payload
      );

      setSuccess(
        response.data.message ||
          "Offre modifiée avec succès."
      );

      setTimeout(() => {
        navigate("/company/jobs");
      }, 1200);
    } catch (err) {
      console.error(
        "Erreur modification offre :",
        err
      );

      setError(
        err.response?.data?.message ||
          "Impossible de modifier l’offre."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <section className="mx-auto max-w-5xl px-6 py-12">
        <p className="text-lg text-slate-600">
          Chargement de l’offre...
        </p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-5xl px-6 py-12">
      <Link
        to="/company/jobs"
        className="inline-flex items-center gap-2 font-semibold text-blue-600 hover:text-blue-700"
      >
        <FiArrowLeft />
        Retour à mes offres
      </Link>

      <div className="mt-7">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
          <FiEdit2 size={28} />
        </div>

        <h1 className="mt-5 text-4xl font-bold text-slate-900">
          Modifier l’offre
        </h1>

        <p className="mt-3 text-slate-600">
          Modifiez les informations de votre offre
          d’emploi.
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
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="categoryId"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              ID catégorie
            </label>

            <input
              id="categoryId"
              name="categoryId"
              type="number"
              min="1"
              value={formData.categoryId}
              onChange={handleChange}
              placeholder="Ex. 1"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
            />
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
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3"
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
              className="w-full rounded-xl border border-slate-300 px-4 py-3"
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
              className="w-full rounded-xl border border-slate-300 px-4 py-3"
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
              className="w-full rounded-xl border border-slate-300 px-4 py-3"
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
              className="w-full rounded-xl border border-slate-300 px-4 py-3"
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
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3"
            >
              <option value="draft">
                Brouillon
              </option>
              <option value="active">
                Active
              </option>
              <option value="closed">
                Fermée
              </option>
              <option value="expired">
                Expirée
              </option>
            </select>
          </div>
        </div>

        <div>
          <label
            htmlFor="description"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Description *
          </label>

          <textarea
            id="description"
            name="description"
            rows="6"
            value={formData.description}
            onChange={handleChange}
            required
            className="w-full rounded-xl border border-slate-300 px-4 py-3"
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
            className="w-full rounded-xl border border-slate-300 px-4 py-3"
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
            className="w-full rounded-xl border border-slate-300 px-4 py-3"
          />
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-7 sm:flex-row sm:justify-end">
          <Link
            to="/company/jobs"
            className="rounded-xl border border-slate-300 px-6 py-3 text-center font-semibold text-slate-700 hover:bg-slate-100"
          >
            Annuler
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
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

export default EditJob;