"use client";

import { useEffect, useState } from "react";
import Papa from "papaparse";
import { motion } from "framer-motion";
import { Upload, KeyRound, Check, AlertTriangle, FileSpreadsheet } from "lucide-react";
import HospitalManager from "@/components/admin/HospitalManager";
import DesaparecidosAdmin from "@/components/admin/DesaparecidosAdmin";

type ImportResult = {
  ok: boolean;
  creados?: number;
  totalFilas?: number;
  errores?: string[];
  error?: string;
};

export default function AdminPage() {
  const [token, setToken] = useState("");
  const [filename, setFilename] = useState("");
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setToken(localStorage.getItem("admin_token") || "");
  }, []);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFilename(file.name);
    setResult(null);
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => setRows(res.data),
    });
  };

  const importar = async () => {
    if (!token) {
      alert("Ingresa la clave de administrador (ADMIN_TOKEN).");
      return;
    }
    setLoading(true);
    setResult(null);
    localStorage.setItem("admin_token", token);
    try {
      const res = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-token": token },
        body: JSON.stringify({ filas: rows }),
      });
      setResult(await res.json());
    } catch {
      setResult({ ok: false, error: "No se pudo conectar al servidor." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-app py-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-slate-900">Panel de administración</h1>
      <p className="mt-1 text-slate-500">
        Carga los listados de personas a la base de datos sin perder los datos
        existentes.
      </p>

      {/* Token */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <KeyRound size={16} /> Clave de administrador
        </label>
        <input
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="ADMIN_TOKEN"
          className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-marca"
        />
        <p className="mt-1 text-xs text-slate-400">
          Es la variable <code>ADMIN_TOKEN</code> que configuraste en Railway.
        </p>
      </div>

      {/* Gestión de hospitales y desaparecidos */}
      {token && (
        <div className="mt-5 space-y-5">
          <HospitalManager token={token} />
          <DesaparecidosAdmin token={token} />
        </div>
      )}

      {/* Importar CSV */}
      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="flex items-center gap-2 font-bold text-slate-900">
          <FileSpreadsheet size={18} /> Importar desde CSV / Excel
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Exporta tu listado a CSV. Columnas reconocidas:{" "}
          <code className="text-xs">
            nombre, apellido, cedula, edad, sexo, hospital, area, cama, estado,
            condicion, contacto
          </code>
          . La columna <strong>hospital</strong> puede ser el nombre o el slug
          (ej: <code>catia</code>).
        </p>

        <label className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 px-4 py-8 text-slate-500 hover:border-marca hover:bg-slate-50">
          <Upload size={20} />
          <span>{filename || "Selecciona un archivo .csv"}</span>
          <input type="file" accept=".csv,text/csv" onChange={onFile} className="hidden" />
        </label>

        {rows.length > 0 && (
          <div className="mt-4">
            <p className="text-sm text-slate-600">
              {rows.length} filas detectadas. Vista previa:
            </p>
            <div className="mt-2 max-h-48 overflow-auto rounded-lg border border-slate-200 text-xs">
              <table className="w-full">
                <thead className="sticky top-0 bg-slate-100">
                  <tr>
                    {Object.keys(rows[0]).map((k) => (
                      <th key={k} className="px-2 py-1 text-left font-semibold">
                        {k}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 5).map((r, i) => (
                    <tr key={i} className="border-t border-slate-100">
                      {Object.keys(rows[0]).map((k) => (
                        <td key={k} className="px-2 py-1">
                          {r[k]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={importar}
              disabled={loading}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-marca px-6 py-3 font-semibold text-white disabled:opacity-60"
            >
              <Upload size={18} />
              {loading ? "Importando..." : `Importar ${rows.length} personas`}
            </motion.button>
          </div>
        )}

        {result && (
          <div
            className={`mt-4 rounded-xl p-4 text-sm ${
              result.ok
                ? "bg-emerald-50 text-emerald-800"
                : "bg-red-50 text-red-800"
            }`}
          >
            {result.ok ? (
              <p className="flex items-center gap-2 font-semibold">
                <Check size={16} /> {result.creados} de {result.totalFilas}{" "}
                personas importadas.
              </p>
            ) : (
              <p className="flex items-center gap-2 font-semibold">
                <AlertTriangle size={16} /> {result.error}
              </p>
            )}
            {result.errores && result.errores.length > 0 && (
              <ul className="mt-2 list-disc pl-5 text-xs">
                {result.errores.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <p className="mt-6 text-center text-xs text-slate-400">
        Plantilla de ejemplo:{" "}
        <a href="/plantilla.csv" download className="text-marca underline">
          descargar plantilla.csv
        </a>
      </p>
    </div>
  );
}
