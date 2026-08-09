import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiFileText,
  FiUpload,
} from "react-icons/fi";

import api from "../services/api";

function CandidateCv() {
  const [currentCv, setCurrentCv] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/users/profile");

        setCurrentCv(
          response.data.profile?.cv || ""
        );
      } catch (err) {
        console.error(
          "Erreur récupération CV :",
          err
        );

        setError(
          err.response?.data?.message ||
            "Impossible de récupérer votre CV."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

  function handleFileChange(event) {
    const file = event.target.files?.[0];

    setError("");
    setSuccess("");

    if (!file) {
      setSelectedFile(null);
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      setSelectedFile(null);

      setError(
        "Seuls les fichiers PDF, DOC et DOCX sont autorisés."
      );

      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setSelectedFile(null);

      setError(
        "Le fichier ne doit pas dépasser 5 Mo."
      );

      return;
    }

    setSelectedFile(file);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!selectedFile) {
      setError(
        "Veuillez sélectionner un fichier."
      );

      return;
    }

    try {
      setUploading(true);
      setError("");
      setSuccess("");

      const formData = new FormData();

      formData.append(
        "cv",
        selectedFile
      );

      const response = await api.post(
        "/uploads/cv",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setCurrentCv(
        response.data.cv || ""
      );

      setSelectedFile(null);

      setSuccess(
        response.data.message ||
          "CV ajouté avec succès."
      );

      const input = document.getElementById(
        "candidate-cv"
      );

      if (input) {
        input.value = "";
      }
    } catch (err) {
      console.error(
        "Erreur upload CV :",
        err
      );

      setError(
        err.response?.data?.message ||
          "Impossible d’envoyer votre CV."
      );
    } finally {
      setUploading(false);
    }
  }

  function buildCvUrl(cvPath) {
    if (!cvPath) {
      return "";
    }

    if (
      cvPath.startsWith("http://") ||
      cvPath.startsWith("https://")
    ) {
      return cvPath;
    }

    if (cvPath.startsWith("uploads/")) {
      return `http://localhost:5000/${cvPath}`;
    }

    return `http://localhost:5000/uploads/cvs/${cvPath}`;
  }

  if (loading) {
    return (
      <section className="mx-auto max-w-4xl px-6 py-12">
        <p className="text-lg text-slate-600">
          Chargement de votre CV...
        </p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-4xl px-6 py-12">
      <Link
        to="/candidate/dashboard"
        className="inline-flex items-center gap-2 font-semibold text-blue-600 hover:text-blue-700"
      >
        <FiArrowLeft />
        Retour au tableau de bord
      </Link>

      <div className="mt-7">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
          <FiFileText size={28} />
        </div>

        <h1 className="mt-5 text-4xl font-bold text-slate-900">
          Mon CV
        </h1>

        <p className="mt-3 text-slate-600">
          Ajoutez votre CV pour pouvoir postuler
          rapidement aux offres d’emploi.
        </p>
      </div>

      {error && (
        <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700">
          {success}
        </div>
      )}

      <div className="mt-10 grid gap-8 md:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900">
            CV actuel
          </h2>

          {currentCv ? (
            <>
              <div className="mt-6 flex h-32 items-center justify-center rounded-2xl bg-slate-50">
                <FiFileText
                  size={50}
                  className="text-blue-600"
                />
              </div>

              <p className="mt-5 text-sm text-slate-600">
                Un CV est actuellement enregistré
                dans votre profil.
              </p>

              <a
                href={buildCvUrl(currentCv)}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
              >
                Ouvrir mon CV
              </a>
            </>
          ) : (
            <div className="mt-6 rounded-2xl bg-slate-50 p-8 text-center">
              <FiFileText
                size={42}
                className="mx-auto text-slate-400"
              />

              <h3 className="mt-4 font-bold text-slate-900">
                Aucun CV
              </h3>

              <p className="mt-2 text-sm text-slate-600">
                Vous n’avez pas encore ajouté de CV.
              </p>
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900">
            {currentCv
              ? "Remplacer mon CV"
              : "Ajouter mon CV"}
          </h2>

          <p className="mt-3 text-slate-600">
            Formats acceptés : PDF, DOC et DOCX.
            Taille maximale : 5 Mo.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-7"
          >
            <label
              htmlFor="candidate-cv"
              className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center hover:border-blue-400 hover:bg-blue-50"
            >
              <FiUpload
                size={38}
                className="text-blue-600"
              />

              <span className="mt-4 font-semibold text-slate-900">
                Choisir un fichier
              </span>

              <span className="mt-2 text-sm text-slate-500">
                PDF, DOC ou DOCX
              </span>

              <input
                id="candidate-cv"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            {selectedFile && (
              <div className="mt-5 rounded-xl border border-blue-200 bg-blue-50 p-4">
                <p className="text-sm font-semibold text-blue-800">
                  Fichier sélectionné
                </p>

                <p className="mt-1 break-all text-sm text-blue-700">
                  {selectedFile.name}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={
                uploading ||
                !selectedFile
              }
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FiUpload />

              {uploading
                ? "Envoi en cours..."
                : currentCv
                  ? "Remplacer mon CV"
                  : "Ajouter mon CV"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default CandidateCv;