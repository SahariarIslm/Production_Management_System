import { useEffect, useMemo, useState } from "react";
import client from "../api/client";

export default function Traceability() {
  const [batchId, setBatchId] = useState("");
  const [finishedProducts, setFinishedProducts] = useState([]);
  const [trace, setTrace] = useState(null);
  const [error, setError] = useState("");

  const finishedBatches = useMemo(
    () =>
      finishedProducts.flatMap((product) =>
        (product.batches || []).map((batch) => ({
          ...batch,
          productName: product.name,
        })),
      ),
    [finishedProducts],
  );

  useEffect(() => {
    client.get("/finished-products").then((res) => setFinishedProducts(res.data));
  }, []);

  const lookup = async () => {
    setError("");
    setTrace(null);
    try {
      const res = await client.get(`/finished-batches/${batchId}/trace`);
      setTrace(res.data);
    } catch {
      setError("Batch not found or trace failed.");
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Batch Traceability</h1>
        <p className="text-sm text-slate-600">
          Trace a finished batch back to semi-finished inputs and originating raw material batches.
        </p>
      </div>

      <div className="rounded-md border border-slate-200 bg-white p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <select
            className="rounded-md border border-slate-300 px-3 py-2"
            value={batchId}
            onChange={(event) => setBatchId(event.target.value)}
          >
            <option value="">Select finished batch</option>
            {finishedBatches.map((batch) => (
              <option key={batch.id} value={batch.id}>
                {batch.batch_number} - {batch.productName} ({batch.status})
              </option>
            ))}
          </select>
          <button onClick={lookup} className="rounded-md bg-teal-700 px-4 py-2 font-semibold text-white hover:bg-teal-800">
            Trace
          </button>
        </div>
      </div>

      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      {trace && (
        <div className="space-y-4">
          <div className="rounded-md border border-slate-200 bg-white p-4">
            <p>
              <strong>Finished Batch:</strong> {trace.finished_batch.batch_number} - {trace.finished_batch.product}
            </p>
            <p>
              <strong>Quantity:</strong> {trace.finished_batch.quantity} | <strong>Status:</strong> {trace.finished_batch.status}
            </p>
          </div>

          {trace.semi_finished_sources.map((source) => (
            <div key={source.batch_id} className="rounded-md border-l-4 border-sky-500 bg-white p-4 shadow-sm">
              <p>
                <strong>Semi-Finished:</strong> {source.batch_number} - {source.product} (used {source.quantity_consumed})
              </p>
              {source.raw_material_sources.map((raw) => (
                <div key={raw.batch_id} className="mt-3 rounded-md border-l-4 border-emerald-500 bg-emerald-50 p-3">
                  <p>
                    <strong>Raw Material:</strong> {raw.batch_number} - {raw.raw_material} (used {raw.quantity_consumed}, received{" "}
                    {new Date(raw.received_at).toLocaleDateString()})
                  </p>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
