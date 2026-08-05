import { useEffect, useMemo, useState } from "react";
import client from "../api/client";

const emptyConsumption = { id: "", quantity: "" };

function RabbitMqNotice() {
  return (
    <section className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
      <h2 className="font-semibold">RabbitMQ-triggering actions</h2>
      <p className="mt-1">
        Submitting either production form sends a Laravel queued job to RabbitMQ. The API returns
        <span className="font-semibold"> 202 Accepted</span>, then the worker consumes the message and completes inventory/history updates.
      </p>
      <p className="mt-2">
        RabbitMQ dashboard: <span className="font-semibold">http://localhost:15672</span> using
        <span className="font-semibold"> pms_user / pms_password</span>. Open Queues, then inspect
        <span className="font-semibold"> production_events</span> for ready/unacked messages while submitting production.
      </p>
    </section>
  );
}

export default function Production() {
  const [rawMaterials, setRawMaterials] = useState([]);
  const [semiProducts, setSemiProducts] = useState([]);
  const [finishedProducts, setFinishedProducts] = useState([]);
  const [semiForm, setSemiForm] = useState({
    semi_finished_product_id: "",
    batch_number: "",
    quantity: "",
    consumptions: [{ ...emptyConsumption }],
  });
  const [finishedForm, setFinishedForm] = useState({
    finished_product_id: "",
    batch_number: "",
    quantity: "",
    consumptions: [{ ...emptyConsumption }],
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const completedSemiBatches = useMemo(
    () =>
      semiProducts.flatMap((product) =>
        (product.batches || [])
          .filter((batch) => batch.status === "completed" && Number(batch.quantity_remaining) > 0)
          .map((batch) => ({
            ...batch,
            productName: product.name,
            unit: product.unit,
          })),
      ),
    [semiProducts],
  );

  const load = async () => {
    const [rawRes, semiRes, finishedRes] = await Promise.all([
      client.get("/raw-materials"),
      client.get("/semi-finished-products"),
      client.get("/finished-products"),
    ]);
    setRawMaterials(rawRes.data);
    setSemiProducts(semiRes.data);
    setFinishedProducts(finishedRes.data);
  };

  useEffect(() => {
    let ignore = false;
    Promise.all([
      client.get("/raw-materials"),
      client.get("/semi-finished-products"),
      client.get("/finished-products"),
    ]).then(([rawRes, semiRes, finishedRes]) => {
      if (ignore) return;
      setRawMaterials(rawRes.data);
      setSemiProducts(semiRes.data);
      setFinishedProducts(finishedRes.data);
    });
    return () => {
      ignore = true;
    };
  }, []);

  const updateConsumption = (formName, index, field, value) => {
    const setForm = formName === "semi" ? setSemiForm : setFinishedForm;
    setForm((current) => {
      const consumptions = current.consumptions.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      );
      return { ...current, consumptions };
    });
  };

  const addConsumption = (formName) => {
    const setForm = formName === "semi" ? setSemiForm : setFinishedForm;
    setForm((current) => ({ ...current, consumptions: [...current.consumptions, { ...emptyConsumption }] }));
  };

  const removeConsumption = (formName, index) => {
    const setForm = formName === "semi" ? setSemiForm : setFinishedForm;
    setForm((current) => ({
      ...current,
      consumptions: current.consumptions.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const submitSemiFinished = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");
    try {
      const payload = {
        semi_finished_product_id: Number(semiForm.semi_finished_product_id),
        batch_number: semiForm.batch_number,
        quantity: Number(semiForm.quantity),
        consumptions: semiForm.consumptions.map((item) => ({
          raw_material_id: Number(item.id),
          quantity: Number(item.quantity),
        })),
      };
      const res = await client.post("/production/semi-finished", payload);
      setMessage(`${res.data.message} RabbitMQ job: ProcessSemiFinishedProduction.`);
      setSemiForm({ semi_finished_product_id: "", batch_number: "", quantity: "", consumptions: [{ ...emptyConsumption }] });
      setTimeout(load, 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Semi-finished production failed.");
    }
  };

  const submitFinished = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");
    try {
      const payload = {
        finished_product_id: Number(finishedForm.finished_product_id),
        batch_number: finishedForm.batch_number,
        quantity: Number(finishedForm.quantity),
        consumptions: finishedForm.consumptions.map((item) => ({
          semi_finished_batch_id: Number(item.id),
          quantity: Number(item.quantity),
        })),
      };
      const res = await client.post("/production/finished", payload);
      setMessage(`${res.data.message} RabbitMQ job: ProcessFinishedProduction.`);
      setFinishedForm({ finished_product_id: "", batch_number: "", quantity: "", consumptions: [{ ...emptyConsumption }] });
      setTimeout(load, 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Finished production failed.");
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Production Execution</h1>
        <p className="text-sm text-slate-600">Create batch production runs and let RabbitMQ complete them asynchronously.</p>
      </div>

      <RabbitMqNotice />

      {message && <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p>}
      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="grid gap-5 xl:grid-cols-2">
        <section className="rounded-md border border-slate-200 bg-white p-4">
          <h2 className="text-lg font-semibold">Raw Material to Semi-Finished</h2>
          <p className="mb-4 text-sm text-slate-600">This action dispatches ProcessSemiFinishedProduction to RabbitMQ.</p>
          <form onSubmit={submitSemiFinished} className="space-y-3">
            <select
              className="w-full rounded-md border border-slate-300 px-3 py-2"
              value={semiForm.semi_finished_product_id}
              onChange={(event) => setSemiForm({ ...semiForm, semi_finished_product_id: event.target.value })}
              required
            >
              <option value="">Select semi-finished product</option>
              {semiProducts.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} ({product.sku})
                </option>
              ))}
            </select>
            <div className="grid gap-3 md:grid-cols-2">
              <input
                className="rounded-md border border-slate-300 px-3 py-2"
                placeholder="Batch number"
                value={semiForm.batch_number}
                onChange={(event) => setSemiForm({ ...semiForm, batch_number: event.target.value })}
                required
              />
              <input
                type="number"
                step="0.001"
                className="rounded-md border border-slate-300 px-3 py-2"
                placeholder="Output quantity"
                value={semiForm.quantity}
                onChange={(event) => setSemiForm({ ...semiForm, quantity: event.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              {semiForm.consumptions.map((item, index) => (
                <div key={index} className="grid gap-2 md:grid-cols-[1fr_140px_auto]">
                  <select
                    className="rounded-md border border-slate-300 px-3 py-2"
                    value={item.id}
                    onChange={(event) => updateConsumption("semi", index, "id", event.target.value)}
                    required
                  >
                    <option value="">Raw material consumed</option>
                    {rawMaterials.map((material) => (
                      <option key={material.id} value={material.id}>
                        {material.name} - available {material.quantity_on_hand} {material.unit}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    step="0.001"
                    className="rounded-md border border-slate-300 px-3 py-2"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(event) => updateConsumption("semi", index, "quantity", event.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => removeConsumption("semi", index)}
                    className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                    disabled={semiForm.consumptions.length === 1}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => addConsumption("semi")} className="rounded-md border border-slate-300 px-3 py-2 text-sm">
                Add input
              </button>
            </div>
            <button className="w-full rounded-md bg-teal-700 px-4 py-2 font-semibold text-white hover:bg-teal-800">
              Submit to RabbitMQ
            </button>
          </form>
        </section>

        <section className="rounded-md border border-slate-200 bg-white p-4">
          <h2 className="text-lg font-semibold">Semi-Finished to Finished</h2>
          <p className="mb-4 text-sm text-slate-600">This action dispatches ProcessFinishedProduction to RabbitMQ.</p>
          <form onSubmit={submitFinished} className="space-y-3">
            <select
              className="w-full rounded-md border border-slate-300 px-3 py-2"
              value={finishedForm.finished_product_id}
              onChange={(event) => setFinishedForm({ ...finishedForm, finished_product_id: event.target.value })}
              required
            >
              <option value="">Select finished product</option>
              {finishedProducts.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} ({product.sku})
                </option>
              ))}
            </select>
            <div className="grid gap-3 md:grid-cols-2">
              <input
                className="rounded-md border border-slate-300 px-3 py-2"
                placeholder="Batch number"
                value={finishedForm.batch_number}
                onChange={(event) => setFinishedForm({ ...finishedForm, batch_number: event.target.value })}
                required
              />
              <input
                type="number"
                step="0.001"
                className="rounded-md border border-slate-300 px-3 py-2"
                placeholder="Output quantity"
                value={finishedForm.quantity}
                onChange={(event) => setFinishedForm({ ...finishedForm, quantity: event.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              {finishedForm.consumptions.map((item, index) => (
                <div key={index} className="grid gap-2 md:grid-cols-[1fr_140px_auto]">
                  <select
                    className="rounded-md border border-slate-300 px-3 py-2"
                    value={item.id}
                    onChange={(event) => updateConsumption("finished", index, "id", event.target.value)}
                    required
                  >
                    <option value="">Completed semi-finished batch</option>
                    {completedSemiBatches.map((batch) => (
                      <option key={batch.id} value={batch.id}>
                        {batch.batch_number} - {batch.productName}, remaining {batch.quantity_remaining} {batch.unit}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    step="0.001"
                    className="rounded-md border border-slate-300 px-3 py-2"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(event) => updateConsumption("finished", index, "quantity", event.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => removeConsumption("finished", index)}
                    className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                    disabled={finishedForm.consumptions.length === 1}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => addConsumption("finished")} className="rounded-md border border-slate-300 px-3 py-2 text-sm">
                Add input
              </button>
            </div>
            <button className="w-full rounded-md bg-teal-700 px-4 py-2 font-semibold text-white hover:bg-teal-800">
              Submit to RabbitMQ
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
