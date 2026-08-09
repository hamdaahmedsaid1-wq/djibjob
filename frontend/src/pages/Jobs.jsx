import { useEffect, useState } from "react";
import {
  useSearchParams,
} from "react-router-dom";

import {
  FiBriefcase,
  FiFilter,
  FiMapPin,
  FiSearch,
  FiX,
} from "react-icons/fi";

import api from "../services/api";
import JobCard from "../components/JobCard";

function Jobs() {
  const [searchParams, setSearchParams] =
    useSearchParams();

  const [jobs, setJobs] = useState([]);
  const [categories, setCategories] = useState([]);

  const [filters, setFilters] = useState({
    search:
      searchParams.get("search") || "",

    location:
      searchParams.get("location") || "",

    category:
      searchParams.get("category") || "",

    contractType:
      searchParams.get("contractType") || "",

    minSalary:
      searchParams.get("minSalary") || "",

    maxSalary:
      searchParams.get("maxSalary") || "",

    sort:
      searchParams.get("sort") || "recent",
  });

  const [loading, setLoading] = useState(true);

  const [
    categoriesLoading,
    setCategoriesLoading,
  ] = useState(true);

  const [error, setError] = useState("");

  // =====================================================
  // Catégories
  // =====================================================
  useEffect(() => {
    async function fetchCategories() {
      try {
        setCategoriesLoading(true);

        const response = await api.get(
          "/jobs/categories"
        );

        setCategories(
          response.data.categories || []
        );
      } catch (err) {
        console.error(
          "Erreur catégories :",
          err
        );

        setCategories([]);
      } finally {
        setCategoriesLoading(false);
      }
    }

    fetchCategories();
  }, []);

  // =====================================================
  // Récupération des offres
  // =====================================================
  async function fetchJobs(currentFilters) {
    try {
      setLoading(true);
      setError("");

      const params = {
        status: "active",
        sort:
          currentFilters.sort || "recent",
      };

      if (
        currentFilters.search?.trim()
      ) {
        params.search =
          currentFilters.search.trim();
      }

      if (
        currentFilters.location?.trim()
      ) {
        params.location =
          currentFilters.location.trim();
      }

      if (currentFilters.category) {
        params.category =
          currentFilters.category;
      }

      if (
        currentFilters.contractType
      ) {
        params.contractType =
          currentFilters.contractType;
      }

      if (currentFilters.minSalary) {
        params.minSalary =
          currentFilters.minSalary;
      }

      if (currentFilters.maxSalary) {
        params.maxSalary =
          currentFilters.maxSalary;
      }

      const response = await api.get(
        "/jobs",
        {
          params,
        }
      );

      setJobs(
        response.data.jobs || []
      );
    } catch (err) {
      console.error(
        "Erreur récupération offres :",
        err
      );

      setError(
        err.response?.data?.message ||
          "Impossible de récupérer les offres."
      );
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // Chargement initial depuis l'URL
  // =====================================================
  useEffect(() => {
    const initialFilters = {
      search:
        searchParams.get("search") || "",

      location:
        searchParams.get("location") || "",

      category:
        searchParams.get("category") || "",

      contractType:
        searchParams.get("contractType") ||
        "",

      minSalary:
        searchParams.get("minSalary") || "",

      maxSalary:
        searchParams.get("maxSalary") || "",

      sort:
        searchParams.get("sort") ||
        "recent",
    };

    setFilters(initialFilters);

    fetchJobs(initialFilters);
  }, [searchParams]);

  // =====================================================
  // Modification des champs
  // =====================================================
  function handleChange(event) {
    const {
      name,
      value,
    } = event.target;

    setFilters((current) => ({
      ...current,
      [name]: value,
    }));
  }

  // =====================================================
  // Mettre les filtres dans l'URL
  // =====================================================
  function updateUrl(currentFilters) {
    const params =
      new URLSearchParams();

    if (
      currentFilters.search?.trim()
    ) {
      params.set(
        "search",
        currentFilters.search.trim()
      );
    }

    if (
      currentFilters.location?.trim()
    ) {
      params.set(
        "location",
        currentFilters.location.trim()
      );
    }

    if (currentFilters.category) {
      params.set(
        "category",
        currentFilters.category
      );
    }

    if (
      currentFilters.contractType
    ) {
      params.set(
        "contractType",
        currentFilters.contractType
      );
    }

    if (
      currentFilters.minSalary
    ) {
      params.set(
        "minSalary",
        currentFilters.minSalary
      );
    }

    if (
      currentFilters.maxSalary
    ) {
      params.set(
        "maxSalary",
        currentFilters.maxSalary
      );
    }

    if (
      currentFilters.sort &&
      currentFilters.sort !== "recent"
    ) {
      params.set(
        "sort",
        currentFilters.sort
      );
    }

    setSearchParams(params);
  }

  // =====================================================
  // Recherche
  // =====================================================
  function handleSubmit(event) {
    event.preventDefault();

    updateUrl(filters);
  }

  // =====================================================
  // Réinitialisation
  // =====================================================
  function resetFilters() {
    const emptyFilters = {
      search: "",
      location: "",
      category: "",
      contractType: "",
      minSalary: "",
      maxSalary: "",
      sort: "recent",
    };

    setFilters(emptyFilters);

    setSearchParams({});
  }

  // =====================================================
  // Tri
  // =====================================================
  function handleSortChange(event) {
    const newFilters = {
      ...filters,
      sort: event.target.value,
    };

    setFilters(newFilters);

    updateUrl(newFilters);
  }

  const hasActiveFilters =
    filters.search ||
    filters.location ||
    filters.category ||
    filters.contractType ||
    filters.minSalary ||
    filters.maxSalary;

  return (
    <section className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-12">

        <div>
          <p className="font-semibold text-blue-600">
            Opportunités professionnelles
          </p>

          <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900">
            Offres d’emploi disponibles
          </h1>

          <p className="mt-3 max-w-2xl text-slate-600">
            Recherchez les opportunités qui
            correspondent à votre profil parmi les
            entreprises présentes sur DjibJob.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="flex items-center gap-2">
            <FiFilter className="text-blue-600" />

            <h2 className="text-xl font-bold text-slate-900">
              Recherche avancée
            </h2>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            <div>
              <label
                htmlFor="search"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Poste, compétence ou entreprise
              </label>

              <div className="relative">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                <input
                  id="search"
                  name="search"
                  type="text"
                  value={filters.search}
                  onChange={handleChange}
                  placeholder="Ex. React, développeur..."
                  className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="location"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Localisation
              </label>

              <div className="relative">
                <FiMapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                <input
                  id="location"
                  name="location"
                  type="text"
                  value={filters.location}
                  onChange={handleChange}
                  placeholder="Ex. Djibouti-ville"
                  className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label
                htmlFor="category"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Catégorie
              </label>

              <select
                id="category"
                name="category"
                value={filters.category}
                onChange={handleChange}
                disabled={categoriesLoading}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3"
              >
                <option value="">
                  Toutes les catégories
                </option>

                {categories.map(
                  (category) => (
                    <option
                      key={category.id}
                      value={category.id}
                    >
                      {category.name}
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <label
                htmlFor="contractType"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Contrat
              </label>

              <select
                id="contractType"
                name="contractType"
                value={
                  filters.contractType
                }
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3"
              >
                <option value="">
                  Tous
                </option>

                <option value="CDI">
                  CDI
                </option>

                <option value="CDD">
                  CDD
                </option>

                <option value="Stage">
                  Stage
                </option>

                <option value="Alternance">
                  Alternance
                </option>

                <option value="Freelance">
                  Freelance
                </option>
              </select>
            </div>

            <div>
              <label
                htmlFor="minSalary"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Salaire minimum
              </label>

              <input
                id="minSalary"
                name="minSalary"
                type="number"
                min="0"
                value={filters.minSalary}
                onChange={handleChange}
                placeholder="100000"
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
              />
            </div>

            <div>
              <label
                htmlFor="maxSalary"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Salaire maximum
              </label>

              <input
                id="maxSalary"
                name="maxSalary"
                type="number"
                min="0"
                value={filters.maxSalary}
                onChange={handleChange}
                placeholder="300000"
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
              />
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-between">
            <div>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <FiX />
                  Effacer les filtres
                </button>
              )}
            </div>

            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
            >
              <FiSearch />
              Rechercher
            </button>
          </div>
        </form>

        <div className="mt-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Résultats
            </p>

            <h2 className="mt-1 text-2xl font-bold text-slate-900">
              {loading
                ? "Recherche..."
                : `${jobs.length} offre${
                    jobs.length > 1
                      ? "s"
                      : ""
                  } trouvée${
                    jobs.length > 1
                      ? "s"
                      : ""
                  }`}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <label
              htmlFor="sort"
              className="text-sm font-semibold text-slate-600"
            >
              Trier par
            </label>

            <select
              id="sort"
              value={filters.sort}
              onChange={
                handleSortChange
              }
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5"
            >
              <option value="recent">
                Plus récentes
              </option>

              <option value="oldest">
                Plus anciennes
              </option>

              <option value="salary_desc">
                Salaire décroissant
              </option>

              <option value="salary_asc">
                Salaire croissant
              </option>
            </select>
          </div>
        </div>

        {error && (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
            {error}
          </div>
        )}

        {!error &&
          loading && (
            <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-10 text-center">
              Chargement des offres...
            </div>
          )}

        {!error &&
          !loading &&
          jobs.length === 0 && (
            <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
              <FiBriefcase
                size={40}
                className="mx-auto text-slate-300"
              />

              <h2 className="mt-5 text-2xl font-bold text-slate-900">
                Aucune offre trouvée
              </h2>

              <p className="mt-3 text-slate-600">
                Essayez de modifier vos critères de recherche.
              </p>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-6 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white"
                >
                  Réinitialiser
                </button>
              )}
            </div>
          )}

        {!error &&
          !loading &&
          jobs.length > 0 && (
            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              {jobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                />
              ))}
            </div>
          )}

      </div>
    </section>
  );
}

export default Jobs;