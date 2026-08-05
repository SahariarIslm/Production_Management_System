import { useEffect, useState } from "react";
import client from "../api/client";

const resources = [
  { key: "raw", title: "Raw Materials", endpoint: "/raw-materials" },
  { key: "semi", title: "Semi-Finished Products", endpoint: "/semi-finished-products" },
  { key: "finished", title: "Finished Products", endpoint: "/finished-products" },
];

const emptyForm = { name: "", sku: "", unit: "kg" };

function ProductManager({ title, endpoint }) {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    const res = await client.get(endpoint);
    setItems(res.data);
  };

  useEffect(() => {
    let ignore = false;
    client.get(endpoint).then((res) => {
      if (!ignore) setItems(res.data);
    });
    return () => {
      ignore = true;
    };
  }, [endpoint]);

  const reset = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const save = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");
    try {
      if (editingId) {
        await client.put(`${endpoint}/${editingId}`, form);
        setMessage("Updated successfully.");
      } else {
        await client.post(endpoint, form);
        setMessage("Created successfully.");
      }
      reset();
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Save failed. Check SKU uniqueness and required fields.");
    }
  };

  const remove = async (id) => {
    setMessage("");
    setError("");
    try {
      await client.delete(`${endpoint}/${id}`);
      setMessage("Deleted successfully.");
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Delete failed. This item may already be used by batches.");
    }
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setForm({ name: item.name, sku: item.sku, unit: item.unit });
  };

  return (
    <section className="rounded-md border border-slate-200 bg-white p-4">
      <div className="mb-4 flex flex-col gap-1">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm text-slate-600">Create, edit, and delete master records used in production.</p>
      </div>

      <form onSubmit={save} className="grid gap-3 md:grid-cols-[1fr_1fr_120px_auto]">
        <input
          className="rounded-md border border-slate-300 px-3 py-2"
          placeholder="Name"
          value={form.name}
          onChange={(event) => setForm({ ...form, name: event.target.value })}
          required
        />
        <input
          className="rounded-md border border-slate-300 px-3 py-2"
          placeholder="SKU"
          value={form.sku}
          onChange={(event) => setForm({ ...form, sku: event.target.value })}
          required
        />
        <input
          className="rounded-md border border-slate-300 px-3 py-2"
          placeholder="Unit"
          value={form.unit}
          onChange={(event) => setForm({ ...form, unit: event.target.value })}
          required
        />
        <div className="flex gap-2">
          <button className="rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800">
            {editingId ? "Update" : "Create"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={reset}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {message && <p className="mt-3 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p>}
      {error && <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[620px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">SKU</th>
              <th className="px-3 py-2">Unit</th>
              <th className="px-3 py-2">On Hand</th>
              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-slate-100">
                <td className="px-3 py-2 font-medium">{item.name}</td>
                <td className="px-3 py-2">{item.sku}</td>
                <td className="px-3 py-2">{item.unit}</td>
                <td className="px-3 py-2">{item.quantity_on_hand}</td>
                <td className="px-3 py-2">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(item)}
                      className="rounded-md border border-slate-300 px-3 py-1 text-xs font-semibold"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(item.id)}
                      className="rounded-md border border-red-200 px-3 py-1 text-xs font-semibold text-red-700"
                    >
                      Delete
                    </button>
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

export default function Masters() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Master Data</h1>
        <p className="text-sm text-slate-600">Maintain the item catalogs required by the assignment CRUD APIs.</p>
      </div>
      {resources.map((resource) => (
        <ProductManager key={resource.key} title={resource.title} endpoint={resource.endpoint} />
      ))}
    </div>
  );
}
