import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiUsers,
  FiBriefcase,
  FiFileText,
  FiGrid,
  FiUserCheck,
  FiLogOut,
} from "react-icons/fi";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function AdminDashboard() {
  const { user, logout } = useAuth();

  const [stats, setStats] = useState({
    users: 0,
    candidates: 0,
    companies: 0,
    jobs: 0,
    applications: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/admin/stats");

        setStats(response.data.stats);
      } catch (err) {
        console.error("Erreur dashboard admin :", err);

        setError(
          err.response?.data?.message ||
            "Impossible de charger les statistiques."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const cards = [
    {
      title: "Utilisateurs",
      value: stats.users,
      icon: <FiUsers size={28} />,
      color: "bg-blue-500",
    },
    {
      title: "Candidats",
      value: stats.candidates,
      icon: <FiUserCheck size={28} />,
      color: "bg-green-500",
    },
    {
      title: "Entreprises",
      value: stats.companies,
      icon: <FiGrid size={28} />,
      color: "bg-orange-500",
    },
    {
      title: "Offres",
      value: stats.jobs,
      icon: <FiBriefcase size={28} />,
      color: "bg-purple-500",
    },
    {
      title: "Candidatures",
      value: stats.applications,
      icon: <FiFileText size={28} />,
      color: "bg-red-500",
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <p className="text-xl font-semibold text-slate-600">
          Chargement du tableau de bord...
        </p>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-slate-100 px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div>
            <p className="font-semibold text-blue-600">
              Administration
            </p>

            <h1 className="mt-2 text-4xl font-bold text-slate-900">
              Tableau de bord
            </h1>

            <p className="mt-3 text-slate-600">
              Bienvenue {user?.name || "Administrateur"}.
            </p>
          </div>

          <button
            type="button"
            onClick={logout}
            className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-700"
          >
            <FiLogOut />
            Déconnexion
          </button>
        </div>

        {error && (
          <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {!error && (
          <>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
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

                  <h2 className="mt-5 text-base font-semibold text-slate-600">
                    {card.title}
                  </h2>

                  <p className="mt-2 text-4xl font-bold text-slate-900">
                    {card.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-12">
              <h2 className="text-2xl font-bold text-slate-900">
                Gestion de la plateforme
              </h2>

              <p className="mt-2 text-slate-600">
                Accédez rapidement aux différentes sections d’administration.
              </p>

              <div className="mt-7 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                <Link
                  to="/admin/users"
                  className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <FiUsers size={28} />
                  </div>

                  <h3 className="mt-5 text-2xl font-bold text-slate-900">
                    Utilisateurs
                  </h3>

                  <p className="mt-3 text-slate-600">
                    Gérer les candidats, entreprises et comptes.
                  </p>

                  <p className="mt-5 font-semibold text-blue-600">
                    Gérer les utilisateurs →
                  </p>
                </Link>

                <Link
                  to="/admin/companies"
                  className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                    <FiGrid size={28} />
                  </div>

                  <h3 className="mt-5 text-2xl font-bold text-slate-900">
                    Entreprises
                  </h3>

                  <p className="mt-3 text-slate-600">
                    Consulter et gérer les entreprises inscrites.
                  </p>

                  <p className="mt-5 font-semibold text-orange-600">
                    Gérer les entreprises →
                  </p>
                </Link>

                <Link
                  to="/admin/jobs"
                  className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:border-purple-200 hover:shadow-xl"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                    <FiBriefcase size={28} />
                  </div>

                  <h3 className="mt-5 text-2xl font-bold text-slate-900">
                    Offres
                  </h3>

                  <p className="mt-3 text-slate-600">
                    Consulter, fermer ou supprimer les offres.
                  </p>

                  <p className="mt-5 font-semibold text-purple-600">
                    Gérer les offres →
                  </p>
                </Link>

                <Link
                  to="/admin/applications"
                  className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:border-red-200 hover:shadow-xl"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-red-50 text-red-600">
                    <FiFileText size={28} />
                  </div>

                  <h3 className="mt-5 text-2xl font-bold text-slate-900">
                    Candidatures
                  </h3>

                  <p className="mt-3 text-slate-600">
                    Consulter et gérer les candidatures enregistrées.
                  </p>

                  <p className="mt-5 font-semibold text-red-600">
                    Gérer les candidatures →
                  </p>
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default AdminDashboard;