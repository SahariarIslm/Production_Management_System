import { useEffect, useState } from "react";
import client from "../api/client";

const emptyReceiveForm = {
  raw_material_id: "",
  batch_number: "",
  quantity: "",
  received_at: "",
};

function InventorySection({ title, items, showBatches = false }) {
  return (
    <section className="rounded-md border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        <span className="text-sm text-slate-500">{items.length} records</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">SKU</th>
              <th className="px-3 py-2">Unit</th>
              <th className="px-3 py-2">Qty on Hand</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-slate-100">
                <td className="px-3 py-2 font-medium">{item.name}</td>
                <td className="px-3 py-2">{item.sku}</td>
                <td className="px-3 py-2">{item.unit}</td>
                <td className="px-3 py-2">
                  {item.quantity_on_hand}
                  {showBatches && item.batches?.length > 0 && (
                    <div className="mt-2 space-y-1 text-xs text-slate-500">
                      {item.batches.slice(0, 3).map((batch) => (
                        <div key={batch.id}>
                          {batch.batch_number}: {batch.quantity_remaining} remaining
                        </div>
                      ))}
                      {item.batches.length > 3 && <div>+{item.batches.length - 3} more batches</div>}
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td className="px-3 py-6 text-center text-slate-500" colSpan="4">
                  No inventory records yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function Inventory() {
  const [data, setData] = useState(null);
  const [receiveForm, setReceiveForm] = useState(emptyReceiveForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    setError("");
    try {
      const res = await client.get("/inventory");
      setData(res.data);
    } catch {
      setError("Unable to load inventory.");
    }
  };

  const receiveBatch = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");
    try {
      const payload = {
        batch_number: receiveForm.batch_number,
        quantity: Number(receiveForm.quantity),
      };

      if (receiveForm.received_at) {
        payload.received_at = receiveForm.received_at;
      }

      await client.post(`/raw-materials/${receiveForm.raw_material_id}/receive-batch`, payload);
      setReceiveForm(emptyReceiveForm);
      setMessage("Raw material batch received and inventory updated.");
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to receive raw material batch.");
    }
  };

  useEffect(() => {
    let ignore = false;
    client
      .get("/inventory")
      .then((res) => {
        if (!ignore) setData(res.data);
      })
      .catch(() => {
        if (!ignore) setError("Unable to load inventory.");
      });
    return () => {
      ignore = true;
    };
  }, []);

  if (!data && !error) return <p className="rounded-md bg-white p-6">Loading...</p>;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Current Inventory</h1>
          <p className="text-sm text-slate-600">Independent stock levels for raw, semi-finished, and finished products.</p>
        </div>
        <button onClick={load} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold">
          Refresh
        </button>
      </div>
      {data && (
        <section className="rounded-md border border-slate-200 bg-white p-4">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Receive Raw Material Batch</h2>
            <p className="text-sm text-slate-600">Create the incoming raw batches used as the start of production traceability.</p>
          </div>
          <form onSubmit={receiveBatch} className="grid gap-3 lg:grid-cols-[1.2fr_1fr_140px_180px_auto]">
            <select
              className="rounded-md border border-slate-300 px-3 py-2"
              value={receiveForm.raw_material_id}
              onChange={(event) => setReceiveForm({ ...receiveForm, raw_material_id: event.target.value })}
              required
            >
              <option value="">Select raw material</option>
              {data.raw_materials.map((material) => (
                <option key={material.id} value={material.id}>
                  {material.name} ({material.sku})
                </option>
              ))}
            </select>
            <input
              className="rounded-md border border-slate-300 px-3 py-2"
              placeholder="Batch number"
              value={receiveForm.batch_number}
              onChange={(event) => setReceiveForm({ ...receiveForm, batch_number: event.target.value })}
              required
            />
            <input
              type="number"
              step="0.001"
              min="0.001"
              className="rounded-md border border-slate-300 px-3 py-2"
              placeholder="Quantity"
              value={receiveForm.quantity}
              onChange={(event) => setReceiveForm({ ...receiveForm, quantity: event.target.value })}
              required
            />
            <input
              type="datetime-local"
              className="rounded-md border border-slate-300 px-3 py-2"
              value={receiveForm.received_at}
              onChange={(event) => setReceiveForm({ ...receiveForm, received_at: event.target.value })}
            />
            <button className="rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800">
              Receive
            </button>
          </form>
        </section>
      )}
      {message && <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p>}
      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {data && (
        <>
          <InventorySection title="Raw Materials" items={data.raw_materials} showBatches />
          <InventorySection title="Semi-Finished Products" items={data.semi_finished_products} />
          <InventorySection title="Finished Products" items={data.finished_products} />
        </>
      )}
    </div>
  );
}
