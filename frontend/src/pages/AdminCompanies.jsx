import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiExternalLink,
  FiTrash2,
  FiUserCheck,
  FiUserX,
} from "react-icons/fi";

import api from "../services/api";

function AdminCompanies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchCompanies() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/companies");

      setCompanies(response.data.companies || []);
    } catch (err) {
      console.error("Erreur récupération entreprises :", err);

      setError(
        err.response?.data?.message ||
          "Impossible de récupérer les entreprises."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCompanies();
  }, []);

  async function toggleCompanyStatus(company) {
    try {
      await api.put(
        `/admin/companies/${company.id}/status`,
        {
          isActive: !Boolean(company.is_active),
        }
      );

      await fetchCompanies();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Impossible de modifier le statut de l’entreprise."
      );
    }
  }

  async function removeCompany(company) {
    const confirmed = window.confirm(
      `Supprimer définitivement l'entreprise "${company.company_name}" ?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(
        `/admin/companies/${company.id}`
      );

      await fetchCompanies();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Impossible de supprimer cette entreprise."
      );
    }
  }

  if (loading) {
    return (
      <section className="mx-auto max-w-7xl px-6 py-12">
        <p className="text-lg text-slate-600">
          Chargement des entreprises...
        </p>
      </section>
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
    <section className="mx-auto max-w-7xl px-6 py-12">
      <Link
        to="/admin/dashboard"
        className="inline-flex items-center gap-2 font-semibold text-blue-600 hover:text-blue-700"
      >
        <FiArrowLeft />
        Retour au tableau de bord
      </Link>

      <div className="mt-7">
        <p className="font-semibold text-blue-600">
          Administration
        </p>

        <h1 className="mt-2 text-4xl font-bold text-slate-900">
          Gestion des entreprises
        </h1>

        <p className="mt-3 text-slate-600">
          Consultez, activez, désactivez ou supprimez
          les entreprises inscrites sur DjibJob.
        </p>
      </div>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm text-slate-500">
          Nombre total d'entreprises
        </p>

        <p className="mt-1 text-3xl font-bold text-slate-900">
          {companies.length}
        </p>
      </div>

      {companies.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-10 text-center">
          <h2 className="text-xl font-bold text-slate-900">
            Aucune entreprise
          </h2>

          <p className="mt-2 text-slate-600">
            Aucune entreprise n'est encore enregistrée.
          </p>
        </div>
      ) : (
        <div className="mt-10 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[1100px] text-left">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                  Entreprise
                </th>

                <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                  Responsable
                </th>

                <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                  Secteur
                </th>

                <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                  Adresse
                </th>

                <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                  Statut
                </th>

                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {companies.map((company) => (
                <tr
                  key={company.id}
                  className="border-b border-slate-100 last:border-none hover:bg-slate-50"
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-blue-50 text-lg font-bold text-blue-600">
                        {company.logo ? (
                          <img
                            src={`http://localhost:5000/${company.logo}`}
                            alt={company.company_name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          company.company_name
                            ?.charAt(0)
                            .toUpperCase()
                        )}
                      </div>

                      <div>
                        <p className="font-semibold text-slate-900">
                          {company.company_name}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          {company.email}
                        </p>

                        {company.website && (
                          <a
                            href={company.website}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-1 inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                          >
                            Site web
                            <FiExternalLink />
                          </a>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <p className="font-medium text-slate-800">
                      {company.contact_name || "Non renseigné"}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {company.phone || "Téléphone non renseigné"}
                    </p>
                  </td>

                  <td className="px-6 py-5">
                    <span className="rounded-full bg-violet-50 px-3 py-1 text-sm font-medium text-violet-700">
                      {company.sector || "Non renseigné"}
                    </span>
                  </td>

                  <td className="px-6 py-5 text-slate-600">
                    {company.address || "Non renseignée"}
                  </td>

                  <td className="px-6 py-5">
                    {Boolean(company.is_active) ? (
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
                        Actif
                      </span>
                    ) : (
                      <span className="rounded-full bg-red-50 px-3 py-1 text-sm font-semibold text-red-700">
                        Désactivé
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          toggleCompanyStatus(company)
                        }
                        title={
                          company.is_active
                            ? "Désactiver"
                            : "Activer"
                        }
                        className="rounded-lg border border-slate-200 p-2 text-slate-700 transition hover:bg-slate-100"
                      >
                        {Boolean(company.is_active) ? (
                          <FiUserX />
                        ) : (
                          <FiUserCheck />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          removeCompany(company)
                        }
                        title="Supprimer"
                        className="rounded-lg border border-red-200 p-2 text-red-600 transition hover:bg-red-50"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default AdminCompanies;