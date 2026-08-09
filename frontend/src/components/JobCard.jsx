import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiBriefcase,
  FiMapPin,
} from "react-icons/fi";

function JobCard({ job }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <FiBriefcase size={22} />
        </div>

        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          {job.contract_type}
        </span>
      </div>

      <h2 className="mt-5 text-xl font-bold text-slate-900">
        {job.title}
      </h2>

      <p className="mt-2 font-medium text-slate-600">
        {job.company_name}
      </p>

      <div className="mt-5 flex items-center gap-2 text-sm text-slate-500">
        <FiMapPin />
        <span>{job.location}</span>
      </div>

      {job.category_name && (
        <p className="mt-3 text-sm text-slate-500">
          Catégorie : {job.category_name}
        </p>
      )}

      <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">
        {job.description}
      </p>

      <Link
        to={`/jobs/${job.id}`}
        className="mt-6 inline-flex items-center gap-2 font-semibold text-blue-600 hover:text-blue-700"
      >
        Voir l’offre
        <FiArrowRight />
      </Link>
    </article>
  );
}

export default JobCard;