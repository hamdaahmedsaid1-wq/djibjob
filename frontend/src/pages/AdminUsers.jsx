import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiTrash2,
  FiUserCheck,
  FiUserX,
} from "react-icons/fi";

import api from "../services/api";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchUsers() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/users");

      setUsers(response.data.users || []);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Impossible de récupérer les utilisateurs."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  async function toggleStatus(user) {
    try {
      await api.put(`/admin/users/${user.id}/status`, {
        isActive: !Boolean(user.is_active),
      });

      fetchUsers();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Impossible de modifier le statut."
      );
    }
  }

  async function removeUser(user) {
    const confirmed = window.confirm(
      `Supprimer ${user.name} ?`
    );

    if (!confirmed) return;

    try {
      await api.delete(`/admin/users/${user.id}`);

      fetchUsers();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Impossible de supprimer."
      );
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-12">
        Chargement...
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-12 text-red-600">
        {error}
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-12">

      <Link
        to="/admin/dashboard"
        className="inline-flex items-center gap-2 text-blue-600 font-semibold"
      >
        <FiArrowLeft />
        Retour au tableau de bord
      </Link>

      <h1 className="mt-6 text-4xl font-bold">
        Gestion des utilisateurs
      </h1>

      <p className="mt-3 text-slate-600">
        Liste complète des utilisateurs de DjibJob.
      </p>

      <div className="mt-10 overflow-x-auto rounded-2xl border shadow-sm">

        <table className="w-full">

          <thead className="bg-slate-100">

            <tr>

              <th className="px-5 py-4 text-left">
                Nom
              </th>

              <th className="px-5 py-4 text-left">
                Email
              </th>

              <th className="px-5 py-4 text-left">
                Téléphone
              </th>

              <th className="px-5 py-4 text-left">
                Rôle
              </th>

              <th className="px-5 py-4 text-left">
                Statut
              </th>

              <th className="px-5 py-4 text-right">
                Actions
              </th>

            </tr>

          </thead>

          <tbody>

            {users.map((user) => (

              <tr
                key={user.id}
                className="border-t"
              >

                <td className="px-5 py-4">
                  {user.name}
                </td>

                <td className="px-5 py-4">
                  {user.email}
                </td>

                <td className="px-5 py-4">
                  {user.phone}
                </td>

                <td className="px-5 py-4 capitalize">
                  {user.role}
                </td>

                <td className="px-5 py-4">

                  {user.is_active ? (

                    <span className="text-green-600 font-semibold">
                      Actif
                    </span>

                  ) : (

                    <span className="text-red-600 font-semibold">
                      Désactivé
                    </span>

                  )}

                </td>

                <td className="px-5 py-4">

                  <div className="flex justify-end gap-2">

                    {user.role !== "admin" && (
                      <>
                        <button
                          onClick={() =>
                            toggleStatus(user)
                          }
                          className="rounded-lg border p-2 hover:bg-slate-100"
                        >
                          {user.is_active ? (
                            <FiUserX />
                          ) : (
                            <FiUserCheck />
                          )}
                        </button>

                        <button
                          onClick={() =>
                            removeUser(user)
                          }
                          className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50"
                        >
                          <FiTrash2 />
                        </button>
                      </>
                    )}

                  </div>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </section>
  );
}

export default AdminUsers;