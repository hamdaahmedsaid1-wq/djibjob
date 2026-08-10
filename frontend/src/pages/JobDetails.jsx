import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  FiArrowLeft,
  FiBriefcase,
  FiCheckCircle,
  FiMapPin,
  FiSend,
} from "react-icons/fi";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL ||
  "http://localhost:5000";

function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  const [applying, setApplying] = useState(false);
  const [applicationSent, setApplicationSent] =
    useState(false);

  const [coverLetter, setCoverLetter] = useState("");

  const [error, setError] = useState("");
  const [applicationError, setApplicationError] =
    useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function fetchJob() {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          `/jobs/${id}`
        );

        setJob(response.data.job);
      } catch (err) {
        console.error(
          "Erreur récupération offre :",
          err
        );

        setError(
          err.response?.data?.message ||
            "Impossible de récupérer cette offre."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchJob();
  }, [id]);

  async function handleApply() {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (user?.role !== "candidate") {
      setApplicationError(
        "Seuls les candidats peuvent postuler à une offre."
      );
      return;
    }

    try {
      setApplying(true);
      setApplicationError("");
      setSuccess("");

      const response = await api.post(
        "/applications",
        {
          jobOfferId: Number(id),
          coverLetter:
            coverLetter.trim() || null,
        }
      );

      setSuccess(
        response.data.message ||
          "Candidature envoyée avec succès."
      );

      setApplicationSent(true);
    } catch (err) {
      console.error(
        "Erreur candidature :",
        err
      );

      setApplicationError(
        err.response?.data?.message ||
          "Impossible d’envoyer votre candidature."
      );
    } finally {
      setApplying(false);
    }
  }

  function formatSalary(salary) {
    if (!salary) {
      return "Non précisé";
    }

    return `${Number(salary).toLocaleString(
      "fr-FR"
    )} DJF`;
  }

  function formatDeadline(deadline) {
    if (!deadline) {
      return "Non précisée";
    }

    return new Date(deadline).toLocaleDateString(
      "fr-FR"
    );
  }

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
      <section className="mx-auto max-w-5xl px-6 py-16">
        <p className="text-lg text-slate-600">
          Chargement de l’offre...
        </p>
      </section>
    );
  }

  if (error || !job) {
    return (
      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
          {error || "Offre introuvable."}
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <Link
        to="/jobs"
        className="inline-flex items-center gap-2 font-semibold text-blue-600 hover:text-blue-700"
      >
        <FiArrowLeft />
        Retour aux offres
      </Link>

      <div className="mt-7 grid gap-8 lg:grid-cols-[1fr_340px]">
        <div>
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-blue-50">
                {job.company_logo ? (
                  <img
                    src={buildLogoUrl(
                      job.company_logo
                    )}
                    alt={job.company_name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <FiBriefcase
                    size={28}
                    className="text-blue-600"
                  />
                )}
              </div>

              <div>
                <h1 className="text-4xl font-bold tracking-tight text-slate-900">
                  {job.title}
                </h1>

                <p className="mt-2 text-xl font-semibold text-blue-600">
                  {job.company_name}
                </p>

                <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-600">
                  <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1">
                    <FiMapPin />
                    {job.location}
                  </span>

                  <span className="rounded-full bg-blue-50 px-3 py-1 font-semibold text-blue-700">
                    {job.contract_type}
                  </span>

                  {job.category_name && (
                    <span className="rounded-full bg-violet-50 px-3 py-1 font-semibold text-violet-700">
                      {job.category_name}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900">
                Description
              </h2>

              <p className="mt-4 whitespace-pre-line leading-8 text-slate-700">
                {job.description}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900">
                Missions
              </h2>

              <p className="mt-4 whitespace-pre-line leading-8 text-slate-700">
                {job.missions ||
                  "Aucune mission supplémentaire n’a été précisée."}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900">
                Compétences et prérequis
              </h2>

              <p className="mt-4 whitespace-pre-line leading-8 text-slate-700">
                {job.requirements ||
                  "Aucun prérequis supplémentaire n’a été précisé."}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900">
                À propos de l’entreprise
              </h2>

              <p className="mt-4 leading-8 text-slate-700">
                {job.company_description ||
                  "Aucune description disponible."}
              </p>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-semibold text-slate-500">
                    Secteur
                  </p>

                  <p className="mt-1 text-slate-900">
                    {job.company_sector ||
                      "Non renseigné"}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-500">
                    Adresse
                  </p>

                  <p className="mt-1 text-slate-900">
                    {job.company_address ||
                      "Non renseignée"}
                  </p>
                </div>
              </div>

              {job.company_website && (
                <a
                  href={job.company_website}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex font-semibold text-blue-600 hover:text-blue-700"
                >
                  Visiter le site de l’entreprise →
                </a>
              )}
            </div>
          </div>
        </div>

        <aside>
          <div className="sticky top-6 rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">
              Informations sur l’offre
            </h2>

            <div className="mt-6 space-y-5">
              <div>
                <p className="text-sm font-semibold text-slate-500">
                  Salaire
                </p>

                <p className="mt-1 text-lg font-bold text-slate-900">
                  {formatSalary(job.salary)}
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-500">
                  Expérience
                </p>

                <p className="mt-1 text-slate-900">
                  {job.experience_level ||
                    "Non précisée"}
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-500">
                  Date limite
                </p>

                <p className="mt-1 text-slate-900">
                  {formatDeadline(job.deadline)}
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-500">
                  Statut
                </p>

                <span
                  className={
                    job.status === "active"
                      ? "mt-2 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700"
                      : "mt-2 inline-flex rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600"
                  }
                >
                  {job.status}
                </span>
              </div>
            </div>

            {applicationError && (
              <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {applicationError}
              </div>
            )}

            {success && (
              <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                <div className="flex items-center gap-2 font-semibold">
                  <FiCheckCircle />
                  {success}
                </div>
              </div>
            )}

            {isAuthenticated &&
              user?.role === "candidate" &&
              !applicationSent && (
                <div className="mt-7">
                  <label
                    htmlFor="coverLetter"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Lettre de motivation
                  </label>

                  <textarea
                    id="coverLetter"
                    rows="5"
                    value={coverLetter}
                    onChange={(event) =>
                      setCoverLetter(
                        event.target.value
                      )
                    }
                    placeholder="Expliquez brièvement votre motivation..."
                    className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>
              )}

            {job.status === "active" ? (
              <button
                type="button"
                onClick={handleApply}
                disabled={
                  applying ||
                  applicationSent
                }
                className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {applicationSent ? (
                  <>
                    <FiCheckCircle />
                    Candidature envoyée
                  </>
                ) : applying ? (
                  "Envoi en cours..."
                ) : (
                  <>
                    <FiSend />
                    Postuler à cette offre
                  </>
                )}
              </button>
            ) : (
              <div className="mt-7 rounded-xl bg-slate-100 p-4 text-center font-semibold text-slate-600">
                Cette offre n’accepte plus de candidatures.
              </div>
            )}

            {!isAuthenticated && (
              <p className="mt-4 text-center text-sm text-slate-500">
                Vous serez redirigé vers la connexion pour postuler.
              </p>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}

export default JobDetails;