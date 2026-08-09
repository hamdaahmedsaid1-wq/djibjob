import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiArrowRight,
  FiBriefcase,
  FiCheckCircle,
  FiMapPin,
  FiSearch,
  FiShield,
  FiUsers,
} from "react-icons/fi";

import api from "../services/api";
import JobCard from "../components/JobCard";

function Home() {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");

  useEffect(() => {
    async function fetchJobs() {
      try {
        const response = await api.get("/jobs", {
          params: {
            status: "active",
            sort: "recent",
          },
        });

        setJobs(response.data.jobs || []);
      } catch (error) {
        console.error(
          "Erreur chargement offres accueil :",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    fetchJobs();
  }, []);

  function handleSearch(event) {
    event.preventDefault();

    const params = new URLSearchParams();

    if (search.trim()) {
      params.set("search", search.trim());
    }

    if (location.trim()) {
      params.set("location", location.trim());
    }

    const query = params.toString();

    navigate(
      query
        ? `/jobs?${query}`
        : "/jobs"
    );
  }

  const recentJobs = jobs.slice(0, 4);

  return (
    <main>
      {/* =====================================================
          HERO
      ===================================================== */}
      <section className="relative overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.25),_transparent_38%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.18),_transparent_30%)]" />

        <div className="relative mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-28">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-4 py-2 text-sm font-semibold text-blue-200">
              <FiBriefcase />
              Plateforme emploi à Djibouti
            </span>

            <h1 className="mt-6 max-w-3xl text-5xl font-extrabold tracking-tight text-white sm:text-6xl">
              Trouvez votre prochaine
              <span className="text-blue-400">
                {" "}opportunité
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              DjibJob connecte les candidats aux entreprises
              qui recrutent à Djibouti. Recherchez, postulez et
              suivez vos candidatures depuis une seule plateforme.
            </p>

            <form
              onSubmit={handleSearch}
              className="mt-9 rounded-2xl bg-white p-3 shadow-2xl"
            >
              <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                <div className="relative">
                  <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                  <input
                    type="text"
                    value={search}
                    onChange={(event) =>
                      setSearch(event.target.value)
                    }
                    placeholder="Poste, compétence ou entreprise"
                    className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-slate-900 outline-none focus:border-blue-500"
                  />
                </div>

                <div className="relative">
                  <FiMapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                  <input
                    type="text"
                    value={location}
                    onChange={(event) =>
                      setLocation(event.target.value)
                    }
                    placeholder="Ville ou localisation"
                    className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-slate-900 outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
                >
                  <FiSearch />
                  Rechercher
                </button>
              </div>
            </form>

            <div className="mt-7 flex flex-wrap gap-5 text-sm text-slate-300">
              <span className="inline-flex items-center gap-2">
                <FiCheckCircle className="text-emerald-400" />
                Candidature en ligne
              </span>

              <span className="inline-flex items-center gap-2">
                <FiCheckCircle className="text-emerald-400" />
                Suivi en temps réel
              </span>

              <span className="inline-flex items-center gap-2">
                <FiCheckCircle className="text-emerald-400" />
                Entreprises locales
              </span>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-white p-6">
                  <FiBriefcase
                    size={30}
                    className="text-blue-600"
                  />

                  <p className="mt-5 text-4xl font-bold text-slate-900">
                    {jobs.length}
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-500">
                    Offres disponibles
                  </p>
                </div>

                <div className="rounded-2xl bg-white p-6">
                  <FiUsers
                    size={30}
                    className="text-purple-600"
                  />

                  <p className="mt-5 text-4xl font-bold text-slate-900">
                    3
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-500">
                    Types d'espaces
                  </p>
                </div>

                <div className="rounded-2xl bg-white p-6 sm:col-span-2">
                  <p className="text-sm font-semibold text-slate-500">
                    Pour les candidats
                  </p>

                  <p className="mt-2 text-xl font-bold text-slate-900">
                    Profil, CV, candidatures et notifications
                  </p>

                  <Link
                    to="/register"
                    className="mt-5 inline-flex items-center gap-2 font-semibold text-blue-600"
                  >
                    Créer un compte
                    <FiArrowRight />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          STATISTIQUES
      ===================================================== */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-6 py-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-3xl font-extrabold text-slate-900">
              {jobs.length}+
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Opportunités actives
            </p>
          </div>

          <div>
            <p className="text-3xl font-extrabold text-slate-900">
              100%
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Candidatures numériques
            </p>
          </div>

          <div>
            <p className="text-3xl font-extrabold text-slate-900">
              24/7
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Accès aux offres
            </p>
          </div>

          <div>
            <p className="text-3xl font-extrabold text-slate-900">
              3
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Espaces sécurisés
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          OFFRES RÉCENTES
      ===================================================== */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="font-semibold text-blue-600">
                Opportunités récentes
              </p>

              <h2 className="mt-2 text-3xl font-bold text-slate-900">
                Les dernières offres publiées
              </h2>

              <p className="mt-3 text-slate-600">
                Découvrez les entreprises qui recrutent actuellement.
              </p>
            </div>

            <Link
              to="/jobs"
              className="inline-flex items-center gap-2 font-semibold text-blue-600 hover:text-blue-700"
            >
              Voir toutes les offres
              <FiArrowRight />
            </Link>
          </div>

          {loading ? (
            <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-10 text-center">
              <p className="text-slate-600">
                Chargement des offres...
              </p>
            </div>
          ) : recentJobs.length === 0 ? (
            <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-10 text-center">
              <FiBriefcase
                size={40}
                className="mx-auto text-slate-300"
              />

              <p className="mt-4 text-slate-600">
                Aucune offre active pour le moment.
              </p>
            </div>
          ) : (
            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              {recentJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* =====================================================
          AVANTAGES
      ===================================================== */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-semibold text-blue-600">
              Pourquoi DjibJob ?
            </p>

            <h2 className="mt-2 text-3xl font-bold text-slate-900">
              Une plateforme pensée pour le recrutement moderne
            </h2>

            <p className="mt-4 text-slate-600">
              Candidats, entreprises et administrateurs disposent
              chacun d'un espace adapté à leurs besoins.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <div className="djibjob-card p-7">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <FiSearch size={28} />
              </div>

              <h3 className="mt-5 text-xl font-bold text-slate-900">
                Recherche avancée
              </h3>

              <p className="mt-3 leading-7 text-slate-600">
                Filtrez les offres par poste, localisation,
                catégorie, contrat et salaire.
              </p>
            </div>

            <div className="djibjob-card p-7">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
                <FiUsers size={28} />
              </div>

              <h3 className="mt-5 text-xl font-bold text-slate-900">
                Suivi des candidatures
              </h3>

              <p className="mt-3 leading-7 text-slate-600">
                Consultez facilement l'état de vos candidatures et
                recevez des notifications lors des mises à jour.
              </p>
            </div>

            <div className="djibjob-card p-7">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <FiShield size={28} />
              </div>

              <h3 className="mt-5 text-xl font-bold text-slate-900">
                Espaces sécurisés
              </h3>

              <p className="mt-3 leading-7 text-slate-600">
                Les accès candidat, entreprise et administrateur
                sont protégés par authentification et rôles.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          CTA
      ===================================================== */}
      <section className="bg-blue-600">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 px-6 py-14 lg:flex-row lg:items-center">
          <div>
            <h2 className="text-3xl font-bold text-white">
              Prêt à commencer ?
            </h2>

            <p className="mt-3 max-w-2xl text-blue-100">
              Créez votre compte DjibJob et accédez à toutes les
              fonctionnalités de la plateforme.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/register"
              className="rounded-xl bg-white px-6 py-3 font-semibold text-blue-600 transition hover:bg-blue-50"
            >
              Créer un compte
            </Link>

            <Link
              to="/jobs"
              className="rounded-xl border border-white/40 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
            >
              Voir les offres
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Home;