import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiBriefcase,
  FiFileText,
  FiPlusCircle,
  FiClock,
  FiLogOut,
  FiSettings,
  FiUser,
  FiBarChart2,
} from "react-icons/fi";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL ||
  "http://localhost:5000";

function CompanyDashboard() {
  const { user, logout } = useAuth();

  const [company, setCompany] = useState(null);

  const [stats, setStats] = useState({
    jobs: 0,
    activeJobs: 0,
    applications: 0,
    pendingApplications: 0,
  });

  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchDashboard() {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          "/company/dashboard"
        );

        setCompany(response.data.company);

        setStats(
          response.data.stats || {
            jobs: 0,
            activeJobs: 0,
            applications: 0,
            pendingApplications: 0,
          }
        );

        setRecentJobs(
          response.data.recentJobs || []
        );
      } catch (err) {
        console.error(
          "Erreur dashboard entreprise :",
          err
        );

        setError(
          err.response?.data?.message ||
            "Impossible de charger le tableau de bord."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, []);

  function buildLogoUrl(logoPath) {
    if (!logoPath) {
      return "";
    }

    if (
      logoPath.startsWith("http://") ||
      logoPath.startsWith("https://")
    ) {
      return logoPath;
    }

    if (logoPath.startsWith("uploads/")) {
      return `${BACKEND_URL}/${logoPath}`;
    }

    return `${BACKEND_URL}/uploads/logos/${logoPath}`;
  }

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

  const cards = [
    {
      title: "Offres publiées",
      value: stats.jobs,
      icon: <FiBriefcase size={28} />,
      color: "bg-blue-500",
    },
    {
      title: "Offres actives",
      value: stats.activeJobs,
      icon: <FiClock size={28} />,
      color: "bg-emerald-500",
    },
    {
      title: "Candidatures reçues",
      value: stats.applications,
      icon: <FiFileText size={28} />,
      color: "bg-purple-500",
    },
    {
      title: "En attente",
      value: stats.pendingApplications,
      icon: <FiClock size={28} />,
      color: "bg-orange-500",
    },
  ];

  return (
    <section className="min-h-screen bg-slate-100 px-6 py-10">
      <div className="mx-auto max-w-7xl">

        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="flex items-center gap-4">

            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-sm">
              {company?.logo ? (
                <img
                  src={buildLogoUrl(company.logo)}
                  alt={company.company_name}
                  className="h-full w-full object-contain p-2"
                />
              ) : (
                <FiBriefcase
                  size={28}
                  className="text-blue-600"
                />
              )}
            </div>

            <div>
              <p className="font-semibold text-blue-600">
                Espace entreprise
              </p>

              <h1 className="mt-1 text-4xl font-bold text-slate-900">
                {company?.company_name ||
                  "Tableau de bord"}
              </h1>

              <p className="mt-2 text-slate-600">
                Bienvenue {user?.name}.
              </p>
            </div>

          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/company/profile"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <FiSettings />
              Profil entreprise
            </Link>

            <Link
              to="/company/stats"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-3 font-semibold text-white transition hover:bg-purple-700"
            >
              <FiBarChart2 />
              Statistiques
            </Link>

            <button
              type="button"
              onClick={logout}
              className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-700"
            >
              <FiLogOut />
              Déconnexion
            </button>
          </div>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <div
              key={card.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div
                className={`inline-flex rounded-xl p-4 text-white ${card.color}`}
              >
                {card.icon}
              </div>

              <p className="mt-5 text-sm font-semibold text-slate-500">
                {card.title}
              </p>

              <p className="mt-2 text-4xl font-bold text-slate-900">
                {card.value}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-5">

          <Link
            to="/company/profile"
            className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
          >
            <FiUser
              size={32}
              className="text-orange-600"
            />

            <h2 className="mt-5 text-2xl font-bold text-slate-900">
              Profil entreprise
            </h2>

            <p className="mt-3 text-slate-600">
              Modifiez les informations et le logo de votre entreprise.
            </p>

            <p className="mt-5 font-semibold text-orange-600">
              Modifier le profil →
            </p>
          </Link>

          <Link
            to="/company/stats"
            className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
          >
            <FiBarChart2
              size={32}
              className="text-purple-600"
            />

            <h2 className="mt-5 text-2xl font-bold text-slate-900">
              Statistiques
            </h2>

            <p className="mt-3 text-slate-600">
              Analysez vos offres et les candidatures reçues.
            </p>

            <p className="mt-5 font-semibold text-purple-600">
              Voir les statistiques →
            </p>
          </Link>

          <Link
            to="/company/jobs"
            className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
          >
            <FiBriefcase
              size={32}
              className="text-blue-600"
            />

            <h2 className="mt-5 text-2xl font-bold text-slate-900">
              Mes offres
            </h2>

            <p className="mt-3 text-slate-600">
              Consultez et gérez toutes vos offres d’emploi.
            </p>

            <p className="mt-5 font-semibold text-blue-600">
              Voir mes offres →
            </p>
          </Link>

          <Link
            to="/company/jobs/create"
            className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
          >
            <FiPlusCircle
              size={32}
              className="text-emerald-600"
            />

            <h2 className="mt-5 text-2xl font-bold text-slate-900">
              Publier une offre
            </h2>

            <p className="mt-3 text-slate-600">
              Créez une nouvelle opportunité pour les candidats.
            </p>

            <p className="mt-5 font-semibold text-emerald-600">
              Publier →
            </p>
          </Link>

          <Link
            to="/company/applications"
            className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
          >
            <FiFileText
              size={32}
              className="text-pink-600"
            />

            <h2 className="mt-5 text-2xl font-bold text-slate-900">
              Candidatures
            </h2>

            <p className="mt-3 text-slate-600">
              Consultez et gérez les candidats ayant postulé.
            </p>

            <p className="mt-5 font-semibold text-pink-600">
              Voir les candidatures →
            </p>
          </Link>

        </div>

        <div className="mt-12">

          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Offres récentes
              </h2>

              <p className="mt-2 text-slate-600">
                Vos dernières offres publiées.
              </p>
            </div>

            <Link
              to="/company/jobs"
              className="font-semibold text-blue-600"
            >
              Voir toutes →
            </Link>
          </div>

          {recentJobs.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
              <FiBriefcase
                size={40}
                className="mx-auto text-slate-400"
              />

              <h3 className="mt-4 text-xl font-bold">
                Aucune offre
              </h3>

              <p className="mt-2 text-slate-600">
                Commencez par publier votre première offre.
              </p>
            </div>
          ) : (
            <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full min-w-[800px] text-left">
                <thead className="border-b bg-slate-50">
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
                  </tr>
                </thead>

                <tbody>
                  {recentJobs.map((job) => (
                    <tr
                      key={job.id}
                      className="border-b last:border-none"
                    >
                      <td className="px-6 py-5 font-semibold">
                        {job.title}
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
                                ? "rounded-full bg-orange-50 px-3 py-1 text-sm font-semibold text-orange-700"
                                : "rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600"
                          }
                        >
                          {job.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>

      </div>
    </section>
  );
}

export default CompanyDashboard;