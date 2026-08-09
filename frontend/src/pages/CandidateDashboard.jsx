import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiBriefcase,
  FiFileText,
  FiUser,
  FiUpload,
  FiLogOut,
  FiClock,
  FiCheckCircle,
  FiXCircle,
} from "react-icons/fi";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function CandidateDashboard() {
  const { user, logout } = useAuth();

  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchDashboard() {
      try {
        setLoading(true);
        setError("");

        const [
          profileResponse,
          applicationsResponse,
        ] = await Promise.all([
          api.get("/users/profile"),
          api.get("/applications/candidate"),
        ]);

        setProfile(
          profileResponse.data.profile || null
        );

        setApplications(
          applicationsResponse.data.applications || []
        );
      } catch (err) {
        console.error(
          "Erreur dashboard candidat :",
          err
        );

        setError(
          err.response?.data?.message ||
            "Impossible de charger votre tableau de bord."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
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

  const acceptedCount = applications.filter(
    (application) =>
      application.status === "accepted"
  ).length;

  const pendingCount = applications.filter(
    (application) =>
      application.status === "pending"
  ).length;

  const rejectedCount = applications.filter(
    (application) =>
      application.status === "rejected"
  ).length;

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <p className="text-xl font-semibold text-slate-600">
          Chargement du tableau de bord...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
          {error}
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-slate-100 px-6 py-10">
      <div className="mx-auto max-w-7xl">

        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-sm">
              {user?.profile_image ? (
                <img
                  src={`http://localhost:5000/${user.profile_image}`}
                  alt={user.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <FiUser
                  size={28}
                  className="text-blue-600"
                />
              )}
            </div>

            <div>
              <p className="font-semibold text-blue-600">
                Espace candidat
              </p>

              <h1 className="mt-1 text-4xl font-bold text-slate-900">
                Bonjour {user?.name || "Candidat"}
              </h1>

              <p className="mt-2 text-slate-600">
                Gérez votre profil et suivez vos candidatures.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700"
          >
            <FiLogOut />
            Déconnexion
          </button>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="inline-flex rounded-xl bg-blue-500 p-4 text-white">
              <FiFileText size={26} />
            </div>

            <p className="mt-5 text-sm font-semibold text-slate-500">
              Candidatures
            </p>

            <p className="mt-2 text-4xl font-bold text-slate-900">
              {applications.length}
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
              {pendingCount}
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
              {acceptedCount}
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
              {rejectedCount}
            </p>
          </div>

        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">

          <Link
            to="/candidate/profile"
            className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
          >
            <FiUser
              size={32}
              className="text-blue-600"
            />

            <h2 className="mt-5 text-2xl font-bold text-slate-900">
              Mon profil
            </h2>

            <p className="mt-3 text-slate-600">
              Modifiez vos informations professionnelles.
            </p>

            <p className="mt-5 font-semibold text-blue-600">
              Modifier mon profil →
            </p>
          </Link>

          <Link
            to="/jobs"
            className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
          >
            <FiBriefcase
              size={32}
              className="text-purple-600"
            />

            <h2 className="mt-5 text-2xl font-bold text-slate-900">
              Rechercher un emploi
            </h2>

            <p className="mt-3 text-slate-600">
              Découvrez les nouvelles opportunités.
            </p>

            <p className="mt-5 font-semibold text-purple-600">
              Voir les offres →
            </p>
          </Link>

          <Link
            to="/candidate/cv"
            className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
          >
            <FiUpload
              size={32}
              className="text-emerald-600"
            />

            <h2 className="mt-5 text-2xl font-bold text-slate-900">
              Mon CV
            </h2>

            <p className="mt-3 text-slate-600">
              Ajoutez ou remplacez votre CV.
            </p>

            <p className="mt-5 font-semibold text-emerald-600">
              Gérer mon CV →
            </p>
          </Link>

        </div>

        <div className="mt-12">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Mes candidatures récentes
              </h2>

              <p className="mt-2 text-slate-600">
                Suivez l’évolution de vos candidatures.
              </p>
            </div>

            <Link
              to="/candidate/applications"
              className="font-semibold text-blue-600"
            >
              Voir toutes →
            </Link>
          </div>

          {applications.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
              <FiFileText
                size={42}
                className="mx-auto text-slate-400"
              />

              <h3 className="mt-4 text-xl font-bold text-slate-900">
                Aucune candidature
              </h3>

              <p className="mt-2 text-slate-600">
                Vous n’avez encore postulé à aucune offre.
              </p>

              <Link
                to="/jobs"
                className="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
              >
                Découvrir les offres
              </Link>
            </div>
          ) : (
            <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full min-w-[850px] text-left">
                <thead className="border-b bg-slate-50">
                  <tr>
                    <th className="px-6 py-4">
                      Offre
                    </th>

                    <th className="px-6 py-4">
                      Entreprise
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
                  </tr>
                </thead>

                <tbody>
                  {applications
                    .slice(0, 5)
                    .map((application) => (
                      <tr
                        key={application.id}
                        className="border-b last:border-none"
                      >
                        <td className="px-6 py-5 font-semibold">
                          {application.job_title}
                        </td>

                        <td className="px-6 py-5">
                          {application.company_name}
                        </td>

                        <td className="px-6 py-5">
                          {application.location}
                        </td>

                        <td className="px-6 py-5">
                          {application.contract_type}
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
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {profile && (
          <div className="mt-12 rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900">
              Résumé du profil
            </h2>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div>
                <p className="text-sm font-semibold text-slate-500">
                  Titre professionnel
                </p>

                <p className="mt-1 text-slate-900">
                  {profile.professional_title ||
                    "Non renseigné"}
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-500">
                  Ville
                </p>

                <p className="mt-1 text-slate-900">
                  {profile.city ||
                    "Non renseignée"}
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-500">
                  Compétences
                </p>

                <p className="mt-1 text-slate-900">
                  {profile.skills ||
                    "Non renseignées"}
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-500">
                  CV
                </p>

                <p className="mt-1 text-slate-900">
                  {profile.cv
                    ? "CV disponible"
                    : "Aucun CV"}
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}

export default CandidateDashboard;