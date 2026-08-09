import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiFileText,
  FiTrash2,
} from "react-icons/fi";

import api from "../services/api";

function AdminApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchApplications() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/admin/applications"
      );

      setApplications(
        response.data.applications || []
      );
    } catch (err) {
      console.error(
        "Erreur récupération candidatures admin :",
        err
      );

      setError(
        err.response?.data?.message ||
          "Impossible de récupérer les candidatures."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchApplications();
  }, []);

  async function changeStatus(
    application,
    newStatus
  ) {
    try {
      await api.put(
        `/admin/applications/${application.id}/status`,
        {
          status: newStatus,
        }
      );

      await fetchApplications();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Impossible de modifier le statut."
      );
    }
  }

  async function removeApplication(application) {
    const confirmed = window.confirm(
      `Supprimer la candidature de "${application.candidate_name}" pour l'offre "${application.job_title}" ?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(
        `/admin/applications/${application.id}`
      );

      await fetchApplications();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Impossible de supprimer cette candidature."
      );
    }
  }

  if (loading) {
    return (
      <section className="mx-auto max-w-7xl px-6 py-12">
        <p className="text-lg text-slate-600">
          Chargement des candidatures...
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
          Gestion des candidatures
        </h1>

        <p className="mt-3 text-slate-600">
          Consultez les candidatures envoyées sur
          DjibJob, modifiez leur statut ou
          supprimez-les.
        </p>
      </div>

      {error && (
        <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {!error && applications.length === 0 && (
        <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <FiFileText
            size={40}
            className="mx-auto text-slate-400"
          />

          <h2 className="mt-4 text-xl font-bold text-slate-900">
            Aucune candidature
          </h2>

          <p className="mt-2 text-slate-600">
            Aucune candidature n’a encore été
            enregistrée.
          </p>
        </div>
      )}

      {!error && applications.length > 0 && (
        <div className="mt-10 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[1200px] text-left">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-6 py-4">
                  Candidat
                </th>

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
                  Statut
                </th>

                <th className="px-6 py-4 text-right">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {applications.map((application) => (
                <tr
                  key={application.id}
                  className="border-b border-slate-100 last:border-none hover:bg-slate-50"
                >
                  <td className="px-6 py-5">
                    <p className="font-semibold text-slate-900">
                      {application.candidate_name}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {application.candidate_email}
                    </p>

                    {application.candidate_phone && (
                      <p className="mt-1 text-sm text-slate-500">
                        {application.candidate_phone}
                      </p>
                    )}

                    {application.professional_title && (
                      <p className="mt-2 text-sm font-medium text-blue-600">
                        {
                          application.professional_title
                        }
                      </p>
                    )}
                  </td>

                  <td className="px-6 py-5">
                    <p className="font-semibold text-slate-900">
                      {application.job_title}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {application.location}
                    </p>
                  </td>

                  <td className="px-6 py-5">
                    {application.company_name}
                  </td>

                  <td className="px-6 py-5">
                    {application.contract_type}
                  </td>

                  <td className="px-6 py-5">
                    <select
                      value={application.status}
                      onChange={(event) =>
                        changeStatus(
                          application,
                          event.target.value
                        )
                      }
                      className="rounded-lg border border-slate-300 bg-white px-3 py-2"
                    >
                      <option value="pending">
                        En attente
                      </option>

                      <option value="reviewed">
                        Consultée
                      </option>

                      <option value="accepted">
                        Acceptée
                      </option>

                      <option value="rejected">
                        Refusée
                      </option>
                    </select>
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() =>
                          removeApplication(
                            application
                          )
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

export default AdminApplications;