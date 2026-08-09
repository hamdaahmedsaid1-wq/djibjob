import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiBriefcase,
  FiTrash2,
} from "react-icons/fi";

import api from "../services/api";

function CandidateApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchApplications() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/applications/candidate"
      );

      setApplications(
        response.data.applications || []
      );
    } catch (err) {
      console.error(
        "Erreur récupération candidatures candidat :",
        err
      );

      setError(
        err.response?.data?.message ||
          "Impossible de récupérer vos candidatures."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchApplications();
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

  async function removeApplication(application) {
    const confirmed = window.confirm(
      `Retirer votre candidature pour "${application.job_title}" ?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(
        `/applications/${application.id}`
      );

      await fetchApplications();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Impossible de retirer cette candidature."
      );
    }
  }

  if (loading) {
    return (
      <section className="mx-auto max-w-7xl px-6 py-12">
        <p className="text-lg text-slate-600">
          Chargement de vos candidatures...
        </p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-12">
      <Link
        to="/candidate/dashboard"
        className="inline-flex items-center gap-2 font-semibold text-blue-600 hover:text-blue-700"
      >
        <FiArrowLeft />
        Retour au tableau de bord
      </Link>

      <div className="mt-7">
        <p className="font-semibold text-blue-600">
          Espace candidat
        </p>

        <h1 className="mt-2 text-4xl font-bold text-slate-900">
          Mes candidatures
        </h1>

        <p className="mt-3 text-slate-600">
          Suivez l’état de toutes vos candidatures
          envoyées sur DjibJob.
        </p>
      </div>

      {error && (
        <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {!error && applications.length === 0 && (
        <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <FiBriefcase
            size={44}
            className="mx-auto text-slate-400"
          />

          <h2 className="mt-4 text-xl font-bold text-slate-900">
            Aucune candidature
          </h2>

          <p className="mt-2 text-slate-600">
            Vous n’avez encore postulé à aucune offre.
          </p>

          <Link
            to="/jobs"
            className="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Voir les offres
          </Link>
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
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                      <FiBriefcase size={26} />
                    </div>

                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">
                        {application.job_title}
                      </h2>

                      <p className="mt-1 font-medium text-slate-600">
                        {application.company_name}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-500">
                        <span>
                          {application.location}
                        </span>

                        <span>•</span>

                        <span>
                          {application.contract_type}
                        </span>
                      </div>
                    </div>
                  </div>

                  {application.cover_letter && (
                    <div className="mt-6 rounded-2xl bg-slate-50 p-5">
                      <p className="text-sm font-semibold text-slate-500">
                        Lettre de motivation
                      </p>

                      <p className="mt-2 leading-7 text-slate-700">
                        {application.cover_letter}
                      </p>
                    </div>
                  )}

                  <div className="mt-5 flex flex-wrap gap-3">
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-semibold ${getStatusClasses(
                        application.status
                      )}`}
                    >
                      {getStatusLabel(
                        application.status
                      )}
                    </span>

                    {application.created_at && (
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
                        Envoyée le{" "}
                        {new Date(
                          application.created_at
                        ).toLocaleDateString("fr-FR")}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 flex-col gap-3 lg:w-56">
                  <Link
                    to={`/jobs/${application.job_offer_id}`}
                    className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-center font-semibold text-blue-700 hover:bg-blue-100"
                  >
                    Voir l’offre
                  </Link>

                  {application.status !== "accepted" && (
                    <button
                      type="button"
                      onClick={() =>
                        removeApplication(
                          application
                        )
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-semibold text-red-700 hover:bg-red-100"
                    >
                      <FiTrash2 />
                      Retirer
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default CandidateApplications;