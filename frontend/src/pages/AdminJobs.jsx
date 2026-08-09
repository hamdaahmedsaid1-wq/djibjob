import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiBriefcase,
  FiTrash2,
} from "react-icons/fi";

import api from "../services/api";

function AdminJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchJobs() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/jobs");

      setJobs(response.data.jobs || []);
    } catch (err) {
      console.error("Erreur récupération offres admin :", err);

      setError(
        err.response?.data?.message ||
          "Impossible de récupérer les offres."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchJobs();
  }, []);

  async function changeStatus(job, status) {
    try {
      await api.put(
        `/admin/jobs/${job.id}/status`,
        {
          status,
        }
      );

      await fetchJobs();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Impossible de modifier le statut."
      );
    }
  }

  async function removeJob(job) {
    const confirmed = window.confirm(
      `Supprimer définitivement l'offre "${job.title}" ?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(
        `/admin/jobs/${job.id}`
      );

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
          Chargement des offres...
        </p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-12">
      <Link
        to="/admin/dashboard"
        className="inline-flex items-center gap-2 font-semibold text-blue-600 hover:text-blue-700"
      >
        <FiArrowLeft />
        Retour au tableau de bord
      </Link>

      <div className="mt-7">
        <p className="font-semibold text-blue-600">
          Administration
        </p>

        <h1 className="mt-2 text-4xl font-bold text-slate-900">
          Gestion des offres
        </h1>

        <p className="mt-3 text-slate-600">
          Consultez, fermez, réactivez ou supprimez les offres publiées sur DjibJob.
        </p>
      </div>

      {error && (
        <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {!error && (
        <div className="mt-10 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[1100px] text-left">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-6 py-4">
                  Offre
                </th>

                <th className="px-6 py-4">
                  Entreprise
                </th>

                <th className="px-6 py-4">
                  Contrat
                </th>

                <th className="px-6 py-4">
                  Localisation
                </th>

                <th className="px-6 py-4">
                  Statut
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
                  className="border-b border-slate-100 last:border-none"
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                        <FiBriefcase size={22} />
                      </div>

                      <div>
                        <p className="font-semibold text-slate-900">
                          {job.title}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          {job.category_name || "Sans catégorie"}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    {job.company_name}
                  </td>

                  <td className="px-6 py-5">
                    {job.contract_type}
                  </td>

                  <td className="px-6 py-5">
                    {job.location}
                  </td>

                  <td className="px-6 py-5">
                    <select
                      value={job.status}
                      onChange={(event) =>
                        changeStatus(
                          job,
                          event.target.value
                        )
                      }
                      className="rounded-lg border border-slate-300 bg-white px-3 py-2"
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
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() =>
                          removeJob(job)
                        }
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

export default AdminJobs;