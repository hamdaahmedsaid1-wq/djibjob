import { Route, Routes } from "react-router-dom";

import Home from "../pages/Home";
import Jobs from "../pages/Jobs";
import JobDetails from "../pages/JobDetails";
import Login from "../pages/Login";
import Register from "../pages/Register";

import CandidateDashboard from "../pages/CandidateDashboard";
import CandidateProfile from "../pages/CandidateProfile";
import CandidateCv from "../pages/CandidateCv";
import CandidateApplications from "../pages/CandidateApplications";

import CompanyDashboard from "../pages/CompanyDashboard";
import CompanyJobs from "../pages/CompanyJobs";
import CreateJob from "../pages/CreateJob";
import EditJob from "../pages/EditJob";
import CompanyApplications from "../pages/CompanyApplications";
import CompanyProfile from "../pages/CompanyProfile";
import CompanyStats from "../pages/CompanyStats";

import AdminDashboard from "../pages/AdminDashboard";
import AdminUsers from "../pages/AdminUsers";
import AdminCompanies from "../pages/AdminCompanies";
import AdminJobs from "../pages/AdminJobs";
import AdminApplications from "../pages/AdminApplications";

import ProtectedRoute from "./ProtectedRoute";

function AppRoutes() {
  return (
    <Routes>
      {/* =========================
          Routes publiques
      ========================= */}
      <Route
        path="/"
        element={<Home />}
      />

      <Route
        path="/jobs"
        element={<Jobs />}
      />

      <Route
        path="/jobs/:id"
        element={<JobDetails />}
      />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      {/* =========================
          Espace candidat
      ========================= */}
      <Route
        path="/candidate/dashboard"
        element={
          <ProtectedRoute allowedRoles={["candidate"]}>
            <CandidateDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/candidate/profile"
        element={
          <ProtectedRoute allowedRoles={["candidate"]}>
            <CandidateProfile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/candidate/cv"
        element={
          <ProtectedRoute allowedRoles={["candidate"]}>
            <CandidateCv />
          </ProtectedRoute>
        }
      />

      <Route
        path="/candidate/applications"
        element={
          <ProtectedRoute allowedRoles={["candidate"]}>
            <CandidateApplications />
          </ProtectedRoute>
        }
      />

      {/* =========================
          Espace entreprise
      ========================= */}
      <Route
        path="/company/dashboard"
        element={
          <ProtectedRoute allowedRoles={["company"]}>
            <CompanyDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/company/profile"
        element={
          <ProtectedRoute allowedRoles={["company"]}>
            <CompanyProfile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/company/stats"
        element={
          <ProtectedRoute allowedRoles={["company"]}>
            <CompanyStats />
          </ProtectedRoute>
        }
      />

      <Route
        path="/company/jobs"
        element={
          <ProtectedRoute allowedRoles={["company"]}>
            <CompanyJobs />
          </ProtectedRoute>
        }
      />

      <Route
        path="/company/jobs/create"
        element={
          <ProtectedRoute allowedRoles={["company"]}>
            <CreateJob />
          </ProtectedRoute>
        }
      />

      <Route
        path="/company/jobs/:id/edit"
        element={
          <ProtectedRoute allowedRoles={["company"]}>
            <EditJob />
          </ProtectedRoute>
        }
      />

      <Route
        path="/company/applications"
        element={
          <ProtectedRoute allowedRoles={["company"]}>
            <CompanyApplications />
          </ProtectedRoute>
        }
      />

      {/* =========================
          Espace administrateur
      ========================= */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminUsers />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/companies"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminCompanies />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/jobs"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminJobs />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/applications"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminApplications />
          </ProtectedRoute>
        }
      />

      {/* =========================
          Page introuvable
      ========================= */}
      <Route
        path="*"
        element={
          <section className="mx-auto max-w-7xl px-6 py-24 text-center">
            <h1 className="text-4xl font-bold text-slate-900">
              Page introuvable
            </h1>

            <p className="mt-4 text-slate-600">
              La page demandée n’existe pas.
            </p>
          </section>
        }
      />
    </Routes>
  );
}

export default AppRoutes;