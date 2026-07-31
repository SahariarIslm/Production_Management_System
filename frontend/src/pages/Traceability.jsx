import { useState } from "react";
import client from "../api/client";

export default function Traceability() {
  const [batchId, setBatchId] = useState("");
  const [trace, setTrace] = useState(null);
  const [error, setError] = useState("");

  const lookup = async () => {
    setError("");
    setTrace(null);
    try {
      const res = await client.get(`/finished-batches/${batchId}/trace`);
      setTrace(res.data);
    } catch (e) {
      setError("Batch not found or trace failed.");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Batch Traceability</h1>
      <div className="flex gap-2 mb-6">
        <input
          className="border p-2 rounded"
          placeholder="Finished Batch ID"
          value={batchId}
          onChange={(e) => setBatchId(e.target.value)}
        />
        <button onClick={lookup} className="bg-blue-600 text-white px-4 py-2 rounded">
          Trace
        </button>
      </div>

      {error && <p className="text-red-600">{error}</p>}

      {trace && (
        <div>
          <div className="mb-4 p-4 border rounded bg-gray-50">
            <p><strong>Finished Batch:</strong> {trace.finished_batch.batch_number} — {trace.finished_batch.product}</p>
            <p><strong>Quantity:</strong> {trace.finished_batch.quantity} | <strong>Status:</strong> {trace.finished_batch.status}</p>
          </div>

          {trace.semi_finished_sources.map((s) => (
            <div key={s.batch_id} className="ml-4 mb-4 p-4 border-l-4 border-blue-400">
              <p><strong>Semi-Finished:</strong> {s.batch_number} — {s.product} (used {s.quantity_consumed})</p>
              {s.raw_material_sources.map((r) => (
                <div key={r.batch_id} className="ml-6 mt-2 p-2 border-l-4 border-green-400">
                  <p><strong>Raw Material:</strong> {r.batch_number} — {r.raw_material} (used {r.quantity_consumed}, received {new Date(r.received_at).toLocaleDateString()})</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}