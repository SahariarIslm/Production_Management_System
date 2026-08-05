import { useEffect, useState } from "react";
import client from "../api/client";

function InventorySection({ title, items }) {
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
                <td className="px-3 py-2">{item.quantity_on_hand}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function Inventory() {
  const [data, setData] = useState(null);
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
      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {data && (
        <>
          <InventorySection title="Raw Materials" items={data.raw_materials} />
          <InventorySection title="Semi-Finished Products" items={data.semi_finished_products} />
          <InventorySection title="Finished Products" items={data.finished_products} />
        </>
      )}
    </div>
  );
}
