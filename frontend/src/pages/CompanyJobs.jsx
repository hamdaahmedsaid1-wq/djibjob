import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiBriefcase,
  FiEdit2,
  FiPlusCircle,
  FiTrash2,
  FiUsers,
} from "react-icons/fi";

import api from "../services/api";

function CompanyJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchJobs() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/company/jobs");

      setJobs(response.data.jobs || []);
    } catch (err) {
      console.error(
        "Erreur récupération offres entreprise :",
        err
      );

      setError(
        err.response?.data?.message ||
          "Impossible de récupérer vos offres."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchJobs();
  }, []);

  async function removeJob(job) {
    const confirmed = window.confirm(
      `Supprimer définitivement l'offre "${job.title}" ?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/jobs/${job.id}`);

      await fetchJobs();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Impossible de supprimer cette offre."
      );
    }
  }

  if (loading) {
    return (
      <section className="mx-auto max-w-7xl px-6 py-12">
        <p className="text-lg text-slate-600">
          Chargement de vos offres...
        </p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-12">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
        <div>
          <Link
            to="/company/dashboard"
            className="inline-flex items-center gap-2 font-semibold text-blue-600 hover:text-blue-700"
          >
            <FiArrowLeft />
            Retour au tableau de bord
          </Link>

          <h1 className="mt-6 text-4xl font-bold text-slate-900">
            Mes offres d’emploi
          </h1>

          <p className="mt-3 text-slate-600">
            Consultez, modifiez ou supprimez les offres publiées par votre entreprise.
          </p>
        </div>

        <Link
          to="/company/jobs/create"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
        >
          <FiPlusCircle />
          Publier une offre
        </Link>
      </div>

      {error && (
        <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {!error && jobs.length === 0 && (
        <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <FiBriefcase
            size={44}
            className="mx-auto text-slate-400"
          />

          <h2 className="mt-4 text-xl font-bold text-slate-900">
            Aucune offre publiée
          </h2>

          <p className="mt-2 text-slate-600">
            Commencez par publier votre première offre d’emploi.
          </p>

          <Link
            to="/company/jobs/create"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            <FiPlusCircle />
            Publier une offre
          </Link>
        </div>
      )}

      {!error && jobs.length > 0 && (
        <div className="mt-10 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[1100px] text-left">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-6 py-4">
                  Offre
                </th>

                <th className="px-6 py-4">
                  Localisation
                </th>

                <th className="px-6 py-4">
                  Contrat
                </th>

                <th className="px-6 py-4">
                  Statut
                </th>

                <th className="px-6 py-4">
                  Candidatures
                </th>

                <th className="px-6 py-4 text-right">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {jobs.map((job) => (
                <tr
                  key={job.id}
                  className="border-b border-slate-100 last:border-none hover:bg-slate-50"
                >
                  <td className="px-6 py-5">
                    <p className="font-semibold text-slate-900">
                      {job.title}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {job.category_name || "Sans catégorie"}
                    </p>
                  </td>

                  <td className="px-6 py-5">
                    {job.location}
                  </td>

                  <td className="px-6 py-5">
                    {job.contract_type}
                  </td>

                  <td className="px-6 py-5">
                    <span
                      className={
                        job.status === "active"
                          ? "rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700"
                          : job.status === "draft"
                            ? "rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600"
                            : job.status === "closed"
                              ? "rounded-full bg-orange-50 px-3 py-1 text-sm font-semibold text-orange-700"
                              : "rounded-full bg-red-50 px-3 py-1 text-sm font-semibold text-red-700"
                      }
                    >
                      {job.status}
                    </span>
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <FiUsers className="text-purple-600" />
                      <span className="font-semibold">
                        {job.applications_count || 0}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex justify-end gap-2">
                      <Link
                        to={`/company/jobs/${job.id}/edit`}
                        title="Modifier"
                        className="rounded-lg border border-blue-200 p-2 text-blue-600 hover:bg-blue-50"
                      >
                        <FiEdit2 />
                      </Link>

                      <button
                        type="button"
                        onClick={() => removeJob(job)}
                        title="Supprimer"
                        className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default CompanyJobs;