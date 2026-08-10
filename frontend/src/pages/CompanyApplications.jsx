import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiCheckCircle,
  FiFileText,
  FiMail,
  FiPhone,
  FiXCircle,
} from "react-icons/fi";

import api from "../services/api";

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL ||
  "http://localhost:5000";

function CompanyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchApplications() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/applications/company"
      );

      setApplications(
        response.data.applications || []
      );
    } catch (err) {
      console.error(
        "Erreur récupération candidatures entreprise :",
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
    status
  ) {
    try {
      await api.put(
        `/applications/${application.id}/status`,
        {
          status,
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
        to="/company/dashboard"
        className="inline-flex items-center gap-2 font-semibold text-blue-600 hover:text-blue-700"
      >
        <FiArrowLeft />
        Retour au tableau de bord
      </Link>

      <div className="mt-7">
        <p className="font-semibold text-blue-600">
          Espace entreprise
        </p>

        <h1 className="mt-2 text-4xl font-bold text-slate-900">
          Candidatures reçues
        </h1>

        <p className="mt-3 text-slate-600">
          Consultez les candidats ayant postulé à vos offres
          et mettez à jour leur statut.
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
            size={42}
            className="mx-auto text-slate-400"
          />

          <h2 className="mt-4 text-xl font-bold text-slate-900">
            Aucune candidature
          </h2>

          <p className="mt-2 text-slate-600">
            Vous n’avez encore reçu aucune candidature.
          </p>
        </div>
      )}

      {!error && applications.length > 0 && (
        <div className="mt-10 grid gap-6">
          {applications.map((application) => (
            <article
              key={application.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
                <div className="flex-1">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-xl font-bold text-blue-600">
                      {application.candidate_name
                        ?.charAt(0)
                        .toUpperCase()}
                    </div>

                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">
                        {application.candidate_name}
                      </h2>

                      {application.professional_title && (
                        <p className="mt-1 font-medium text-blue-600">
                          {application.professional_title}
                        </p>
                      )}

                      <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-500">
                        {application.candidate_email && (
                          <span className="inline-flex items-center gap-2">
                            <FiMail />
                            {application.candidate_email}
                          </span>
                        )}

                        {application.candidate_phone && (
                          <span className="inline-flex items-center gap-2">
                            <FiPhone />
                            {application.candidate_phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 rounded-2xl bg-slate-50 p-5">
                    <p className="text-sm font-semibold text-slate-500">
                      Offre concernée
                    </p>

                    <h3 className="mt-1 text-lg font-bold text-slate-900">
                      {application.job_title}
                    </h3>
                  </div>

                  {application.cover_letter && (
                    <div className="mt-5">
                      <p className="text-sm font-semibold text-slate-500">
                        Lettre de motivation
                      </p>

                      <p className="mt-2 leading-7 text-slate-700">
                        {application.cover_letter}
                      </p>
                    </div>
                  )}

                  <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {application.skills && (
                      <div className="rounded-xl border border-slate-200 p-4">
                        <p className="text-xs font-semibold uppercase text-slate-400">
                          Compétences
                        </p>

                        <p className="mt-2 text-sm text-slate-700">
                          {application.skills}
                        </p>
                      </div>
                    )}

                    {application.education && (
                      <div className="rounded-xl border border-slate-200 p-4">
                        <p className="text-xs font-semibold uppercase text-slate-400">
                          Formation
                        </p>

                        <p className="mt-2 text-sm text-slate-700">
                          {application.education}
                        </p>
                      </div>
                    )}

                    {application.experience && (
                      <div className="rounded-xl border border-slate-200 p-4">
                        <p className="text-xs font-semibold uppercase text-slate-400">
                          Expérience
                        </p>

                        <p className="mt-2 text-sm text-slate-700">
                          {application.experience}
                        </p>
                      </div>
                    )}

                    {application.candidate_cv && (
                      <div className="rounded-xl border border-slate-200 p-4">
                        <p className="text-xs font-semibold uppercase text-slate-400">
                          CV
                        </p>

                        <a
                          href={`${BACKEND_URL}/${application.candidate_cv}`}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 inline-flex font-semibold text-blue-600"
                        >
                          Ouvrir le CV
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <div className="w-full shrink-0 lg:w-56">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${getStatusClasses(
                      application.status
                    )}`}
                  >
                    {getStatusLabel(
                      application.status
                    )}
                  </span>

                  <div className="mt-5 space-y-3">
                    <button
                      type="button"
                      onClick={() =>
                        changeStatus(
                          application,
                          "reviewed"
                        )
                      }
                      className="w-full rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 font-semibold text-blue-700 hover:bg-blue-100"
                    >
                      Marquer consultée
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        changeStatus(
                          application,
                          "accepted"
                        )
                      }
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white hover:bg-emerald-700"
                    >
                      <FiCheckCircle />
                      Accepter
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        changeStatus(
                          application,
                          "rejected"
                        )
                      }
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 font-semibold text-white hover:bg-red-700"
                    >
                      <FiXCircle />
                      Refuser
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default CompanyApplications;