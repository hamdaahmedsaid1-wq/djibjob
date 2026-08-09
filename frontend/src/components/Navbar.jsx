import { Link } from "react-router-dom";
import {
  FiBriefcase,
  FiLogOut,
} from "react-icons/fi";

import { useAuth } from "../context/AuthContext";
import NotificationBell from "./NotificationBell";

function Navbar() {
  const {
    user,
    isAuthenticated,
    logout,
  } = useAuth();

  function getDashboardLink() {
    if (user?.role === "admin") {
      return "/admin/dashboard";
    }

    if (user?.role === "company") {
      return "/company/dashboard";
    }

    return "/candidate/dashboard";
  }

  return (
    <header className="border-b bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">

        <Link
          to="/"
          className="flex shrink-0 items-center gap-2"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
            <FiBriefcase />
          </div>

          <span className="text-2xl font-bold text-slate-900">
            Djib
            <span className="text-blue-600">
              Job
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          <Link
            to="/"
            className="font-medium text-slate-700 transition hover:text-blue-600"
          >
            Accueil
          </Link>

          <Link
            to="/jobs"
            className="font-medium text-slate-700 transition hover:text-blue-600"
          >
            Offres
          </Link>

          {!isAuthenticated ? (
            <>
              <Link
                to="/login"
                className="font-medium text-slate-700 transition hover:text-blue-600"
              >
                Connexion
              </Link>

              <Link
                to="/register"
                className="rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700"
              >
                Inscription
              </Link>
            </>
          ) : (
            <>
              <Link
                to={getDashboardLink()}
                className="font-medium text-slate-700 transition hover:text-blue-600"
              >
                Tableau de bord
              </Link>

              <NotificationBell />

              <div className="flex items-center gap-3">
                <div className="hidden text-right lg:block">
                  <p className="text-sm font-semibold text-slate-900">
                    {user?.name}
                  </p>

                  <p className="text-xs capitalize text-slate-500">
                    {user?.role}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={logout}
                  title="Déconnexion"
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-red-200 bg-white text-red-600 transition hover:bg-red-50"
                >
                  <FiLogOut />
                </button>
              </div>
            </>
          )}
        </nav>

        <div className="flex items-center gap-3 md:hidden">
          {isAuthenticated ? (
            <>
              <NotificationBell />

              <Link
                to={getDashboardLink()}
                className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white"
              >
                Espace
              </Link>

              <button
                type="button"
                onClick={logout}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-red-200 text-red-600"
              >
                <FiLogOut />
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
            >
              Connexion
            </Link>
          )}
        </div>

      </div>
    </header>
  );
}

export default Navbar;