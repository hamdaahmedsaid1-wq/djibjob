import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiSave,
  FiUpload,
  FiGlobe,
  FiMapPin,
  FiBriefcase,
  FiUser,
  FiPhone,
} from "react-icons/fi";

import api from "../services/api";

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL ||
  "http://localhost:5000";

function CompanyProfile() {
  const [formData, setFormData] = useState({
    contactName: "",
    phone: "",
    companyName: "",
    description: "",
    sector: "",
    address: "",
    website: "",
  });

  const [logo, setLogo] = useState("");
  const [selectedLogo, setSelectedLogo] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [logoSuccess, setLogoSuccess] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/company/profile");

      const company = response.data.company || {};

      setFormData({
        contactName: company.contact_name || "",
        phone: company.phone || "",
        companyName: company.company_name || "",
        description: company.description || "",
        sector: company.sector || "",
        address: company.address || "",
        website: company.website || "",
      });

      setLogo(company.logo || "");
    } catch (err) {
      console.error(
        "Erreur récupération profil entreprise :",
        err
      );

      setError(
        err.response?.data?.message ||
          "Impossible de récupérer le profil de l’entreprise."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await api.put(
        "/company/profile",
        {
          contactName: formData.contactName.trim(),
          phone: formData.phone.trim(),
          companyName: formData.companyName.trim(),
          description: formData.description.trim(),
          sector: formData.sector.trim(),
          address: formData.address.trim(),
          website: formData.website.trim(),
        }
      );

      setSuccess(
        response.data.message ||
          "Profil entreprise modifié avec succès."
      );
    } catch (err) {
      console.error(
        "Erreur modification profil entreprise :",
        err
      );

      setError(
        err.response?.data?.message ||
          "Impossible de modifier le profil de l’entreprise."
      );
    } finally {
      setSaving(false);
    }
  }

  function handleLogoChange(event) {
    const file = event.target.files?.[0];

    setLogoSuccess("");
    setError("");

    if (!file) {
      setSelectedLogo(null);
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setSelectedLogo(null);

      setError(
        "Le logo doit être une image JPG, PNG ou WebP."
      );

      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      setSelectedLogo(null);

      setError(
        "Le logo ne doit pas dépasser 3 Mo."
      );

      return;
    }

    setSelectedLogo(file);
  }

  async function handleLogoUpload(event) {
    event.preventDefault();

    if (!selectedLogo) {
      setError(
        "Veuillez sélectionner un logo."
      );
      return;
    }

    try {
      setUploadingLogo(true);
      setError("");
      setLogoSuccess("");

      const logoFormData = new FormData();

      logoFormData.append(
        "logo",
        selectedLogo
      );

      const response = await api.post(
        "/uploads/company-logo",
        logoFormData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

      setLogo(response.data.logo || "");
      setSelectedLogo(null);

      setLogoSuccess(
        response.data.message ||
          "Logo ajouté avec succès."
      );

      const input =
        document.getElementById(
          "company-logo"
        );

      if (input) {
        input.value = "";
      }
    } catch (err) {
      console.error(
        "Erreur upload logo :",
        err
      );

      setError(
        err.response?.data?.message ||
          "Impossible d’envoyer le logo."
      );
    } finally {
      setUploadingLogo(false);
    }
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
      <section className="mx-auto max-w-6xl px-6 py-12">
        <p className="text-lg text-slate-600">
          Chargement du profil entreprise...
        </p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
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
          Profil de l’entreprise
        </h1>

        <p className="mt-3 text-slate-600">
          Présentez votre entreprise aux candidats et
          maintenez vos coordonnées à jour.
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

      <div className="mt-10 grid gap-8 lg:grid-cols-[320px_1fr]">
        <div>
          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">
              Logo
            </h2>

            <div className="mt-6 flex h-48 items-center justify-center overflow-hidden rounded-2xl bg-slate-50">
              {logo ? (
                <img
                  src={buildLogoUrl(logo)}
                  alt={formData.companyName}
                  className="h-full w-full object-contain p-4"
                />
              ) : (
                <div className="text-center">
                  <FiBriefcase
                    size={48}
                    className="mx-auto text-slate-300"
                  />

                  <p className="mt-3 text-sm text-slate-500">
                    Aucun logo
                  </p>
                </div>
              )}
            </div>

            {logoSuccess && (
              <div className="mt-5 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">
                {logoSuccess}
              </div>
            )}

            <form
              onSubmit={handleLogoUpload}
              className="mt-6"
            >
              <label
                htmlFor="company-logo"
                className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center hover:border-blue-400 hover:bg-blue-50"
              >
                <FiUpload
                  size={32}
                  className="text-blue-600"
                />

                <span className="mt-3 font-semibold text-slate-900">
                  Choisir un logo
                </span>

                <span className="mt-1 text-xs text-slate-500">
                  JPG, PNG ou WebP — max 3 Mo
                </span>

                <input
                  id="company-logo"
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp"
                  onChange={handleLogoChange}
                  className="hidden"
                />
              </label>

              {selectedLogo && (
                <p className="mt-3 break-all text-sm text-slate-600">
                  {selectedLogo.name}
                </p>
              )}

              <button
                type="submit"
                disabled={
                  uploadingLogo ||
                  !selectedLogo
                }
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                <FiUpload />

                {uploadingLogo
                  ? "Envoi..."
                  : logo
                    ? "Remplacer le logo"
                    : "Ajouter le logo"}
              </button>
            </form>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-7 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"
        >
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Informations générales
            </h2>

            <p className="mt-2 text-slate-600">
              Ces informations seront visibles par les candidats.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label
                htmlFor="companyName"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Nom de l’entreprise *
              </label>

              <div className="relative">
                <FiBriefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                <input
                  id="companyName"
                  name="companyName"
                  type="text"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="sector"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Secteur
              </label>

              <input
                id="sector"
                name="sector"
                type="text"
                value={formData.sector}
                onChange={handleChange}
                placeholder="Ex. Télécommunications"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="contactName"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Responsable
              </label>

              <div className="relative">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                <input
                  id="contactName"
                  name="contactName"
                  type="text"
                  value={formData.contactName}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="phone"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Téléphone
              </label>

              <div className="relative">
                <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                <input
                  id="phone"
                  name="phone"
                  type="text"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="address"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Adresse
              </label>

              <div className="relative">
                <FiMapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                <input
                  id="address"
                  name="address"
                  type="text"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Djibouti-ville"
                  className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="website"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Site web
              </label>

              <div className="relative">
                <FiGlobe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                <input
                  id="website"
                  name="website"
                  type="url"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://..."
                  className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="description"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Présentation de l’entreprise
            </label>

            <textarea
              id="description"
              name="description"
              rows="7"
              value={formData.description}
              onChange={handleChange}
              placeholder="Présentez votre activité, votre équipe, vos valeurs..."
              className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end border-t border-slate-200 pt-7">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              <FiSave />

              {saving
                ? "Enregistrement..."
                : "Enregistrer les modifications"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default CompanyProfile;