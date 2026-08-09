import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiBriefcase,
  FiFileText,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiEye,
} from "react-icons/fi";

import api from "../services/api";

function CompanyStats() {
  const [company, setCompany] = useState(null);

  const [stats, setStats] = useState({
    jobs: {
      total: 0,
      active: 0,
      closed: 0,
      draft: 0,
    },

    applications: {
      total: 0,
      pending: 0,
      reviewed: 0,
      accepted: 0,
      rejected: 0,
    },
  });

  const [applicationsByJob, setApplicationsByJob] =
    useState([]);

  const [recentApplications, setRecentApplications] =
    useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          "/company/stats"
        );

        setCompany(
          response.data.company || null
        );

        setStats(
          response.data.stats || {
            jobs: {
              total: 0,
              active: 0,
              closed: 0,
              draft: 0,
            },

            applications: {
              total: 0,
              pending: 0,
              reviewed: 0,
              accepted: 0,
              rejected: 0,
            },
          }
        );

        setApplicationsByJob(
          response.data.applicationsByJob || []
        );

        setRecentApplications(
          response.data.recentApplications || []
        );
      } catch (err) {
        console.error(
          "Erreur statistiques entreprise :",
          err
        );

        setError(
          err.response?.data?.message ||
            "Impossible de récupérer les statistiques."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  function getStatusLabel(status) {
    if (status === "accepted") {
      return "Acceptée";
    }

    if (status === "rejected") {
      return "Refusée";
    }

    if (status === "reviewed") {
      return "Consultée";
    }

    return "En attente";
  }

  function getStatusClasses(status) {
    if (status === "accepted") {
      return "bg-emerald-50 text-emerald-700";
    }

    if (status === "rejected") {
      return "bg-red-50 text-red-700";
    }

    if (status === "reviewed") {
      return "bg-blue-50 text-blue-700";
    }

    return "bg-orange-50 text-orange-700";
  }

  if (loading) {
    return (
      <section className="mx-auto max-w-7xl px-6 py-12">
        <p className="text-lg text-slate-600">
          Chargement des statistiques...
        </p>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-slate-100 px-6 py-10">
      <div className="mx-auto max-w-7xl">

        <Link
          to="/company/dashboard"
          className="inline-flex items-center gap-2 font-semibold text-blue-600 hover:text-blue-700"
        >
          <FiArrowLeft />
          Retour au tableau de bord
        </Link>

        <div className="mt-7">
          <p className="font-semibold text-blue-600">
            Statistiques entreprise
          </p>

          <h1 className="mt-2 text-4xl font-bold text-slate-900">
            {company?.companyName ||
              "Statistiques"}
          </h1>

          <p className="mt-3 text-slate-600">
            Analysez vos offres et les candidatures reçues.
          </p>
        </div>

        {error && (
          <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {!error && (
          <>
            <div className="mt-10">
              <h2 className="text-2xl font-bold text-slate-900">
                Offres d’emploi
              </h2>

              <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="inline-flex rounded-xl bg-blue-500 p-4 text-white">
                    <FiBriefcase size={26} />
                  </div>

                  <p className="mt-5 text-sm font-semibold text-slate-500">
                    Total
                  </p>

                  <p className="mt-2 text-4xl font-bold text-slate-900">
                    {stats.jobs.total}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="inline-flex rounded-xl bg-emerald-500 p-4 text-white">
                    <FiCheckCircle size={26} />
                  </div>

                  <p className="mt-5 text-sm font-semibold text-slate-500">
                    Actives
                  </p>

                  <p className="mt-2 text-4xl font-bold text-slate-900">
                    {stats.jobs.active}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="inline-flex rounded-xl bg-orange-500 p-4 text-white">
                    <FiClock size={26} />
                  </div>

                  <p className="mt-5 text-sm font-semibold text-slate-500">
                    Brouillons
                  </p>

                  <p className="mt-2 text-4xl font-bold text-slate-900">
                    {stats.jobs.draft}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="inline-flex rounded-xl bg-slate-500 p-4 text-white">
                    <FiXCircle size={26} />
                  </div>

                  <p className="mt-5 text-sm font-semibold text-slate-500">
                    Fermées
                  </p>

                  <p className="mt-2 text-4xl font-bold text-slate-900">
                    {stats.jobs.closed}
                  </p>
                </div>

              </div>
            </div>

            <div className="mt-12">
              <h2 className="text-2xl font-bold text-slate-900">
                Candidatures
              </h2>

              <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="inline-flex rounded-xl bg-purple-500 p-4 text-white">
                    <FiFileText size={26} />
                  </div>

                  <p className="mt-5 text-sm font-semibold text-slate-500">
                    Total
                  </p>

                  <p className="mt-2 text-4xl font-bold text-slate-900">
                    {stats.applications.total}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="inline-flex rounded-xl bg-orange-500 p-4 text-white">
                    <FiClock size={26} />
                  </div>

                  <p className="mt-5 text-sm font-semibold text-slate-500">
                    En attente
                  </p>

                  <p className="mt-2 text-4xl font-bold text-slate-900">
                    {stats.applications.pending}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="inline-flex rounded-xl bg-blue-500 p-4 text-white">
                    <FiEye size={26} />
                  </div>

                  <p className="mt-5 text-sm font-semibold text-slate-500">
                    Consultées
                  </p>

                  <p className="mt-2 text-4xl font-bold text-slate-900">
                    {stats.applications.reviewed}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="inline-flex rounded-xl bg-emerald-500 p-4 text-white">
                    <FiCheckCircle size={26} />
                  </div>

                  <p className="mt-5 text-sm font-semibold text-slate-500">
                    Acceptées
                  </p>

                  <p className="mt-2 text-4xl font-bold text-slate-900">
                    {stats.applications.accepted}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="inline-flex rounded-xl bg-red-500 p-4 text-white">
                    <FiXCircle size={26} />
                  </div>

                  <p className="mt-5 text-sm font-semibold text-slate-500">
                    Refusées
                  </p>

                  <p className="mt-2 text-4xl font-bold text-slate-900">
                    {stats.applications.rejected}
                  </p>
                </div>

              </div>
            </div>

            <div className="mt-12">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Candidatures par offre
                </h2>

                <p className="mt-2 text-slate-600">
                  Découvrez quelles offres attirent le plus de candidats.
                </p>
              </div>

              {applicationsByJob.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                  <p className="text-slate-600">
                    Aucune donnée disponible.
                  </p>
                </div>
              ) : (
                <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <table className="w-full min-w-[900px] text-left">
                    <thead className="border-b bg-slate-50">
                      <tr>
                        <th className="px-6 py-4">
                          Offre
                        </th>

                        <th className="px-6 py-4">
                          Total
                        </th>

                        <th className="px-6 py-4">
                          En attente
                        </th>

                        <th className="px-6 py-4">
                          Acceptées
                        </th>

                        <th className="px-6 py-4">
                          Refusées
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {applicationsByJob.map(
                        (job) => (
                          <tr
                            key={job.id}
                            className="border-b last:border-none"
                          >
                            <td className="px-6 py-5 font-semibold text-slate-900">
                              {job.title}
                            </td>

                            <td className="px-6 py-5">
                              {job.applications_count}
                            </td>

                            <td className="px-6 py-5">
                              {job.pending_count || 0}
                            </td>

                            <td className="px-6 py-5">
                              {job.accepted_count || 0}
                            </td>

                            <td className="px-6 py-5">
                              {job.rejected_count || 0}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="mt-12">
              <h2 className="text-2xl font-bold text-slate-900">
                Candidatures récentes
              </h2>

              <p className="mt-2 text-slate-600">
                Les cinq dernières candidatures reçues.
              </p>

              {recentApplications.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                  <p className="text-slate-600">
                    Aucune candidature récente.
                  </p>
                </div>
              ) : (
                <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <table className="w-full min-w-[850px] text-left">
                    <thead className="border-b bg-slate-50">
                      <tr>
                        <th className="px-6 py-4">
                          Candidat
                        </th>

                        <th className="px-6 py-4">
                          Offre
                        </th>

                        <th className="px-6 py-4">
                          Date
                        </th>

                        <th className="px-6 py-4">
                          Statut
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {recentApplications.map(
                        (application) => (
                          <tr
                            key={application.id}
                            className="border-b last:border-none"
                          >
                            <td className="px-6 py-5 font-semibold text-slate-900">
                              {
                                application.candidate_name
                              }
                            </td>

                            <td className="px-6 py-5">
                              {
                                application.job_title
                              }
                            </td>

                            <td className="px-6 py-5">
                              {application.created_at
                                ? new Date(
                                    application.created_at
                                  ).toLocaleDateString(
                                    "fr-FR"
                                  )
                                : "-"}
                            </td>

                            <td className="px-6 py-5">
                              <span
                                className={`rounded-full px-3 py-1 text-sm font-semibold ${getStatusClasses(
                                  application.status
                                )}`}
                              >
                                {getStatusLabel(
                                  application.status
                                )}
                              </span>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

      </div>
    </section>
  );
}

export default CompanyStats;