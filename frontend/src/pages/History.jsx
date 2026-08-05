import { useEffect, useState } from "react";
import client from "../api/client";

export default function History() {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const res = await client.get("/production-history");
      setEvents(res.data);
    } catch {
      setError("Unable to load production history.");
    }
  };

  useEffect(() => {
    let ignore = false;
    client
      .get("/production-history")
      .then((res) => {
        if (!ignore) setEvents(res.data);
      })
      .catch(() => {
        if (!ignore) setError("Unable to load production history.");
      });
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Production History</h1>
          <p className="text-sm text-slate-600">Events recorded by the RabbitMQ queue worker after async completion.</p>
        </div>
        <button onClick={load} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold">
          Refresh
        </button>
      </div>

      <section className="rounded-md border border-sky-200 bg-sky-50 p-4 text-sm text-sky-950">
        <p>
          To visualize queue state, open <span className="font-semibold">http://localhost:15672</span>, sign in with
          <span className="font-semibold"> pms_user / pms_password</span>, then check the
          <span className="font-semibold"> production_events</span> queue for Ready, Unacked, and Total message counts.
        </p>
      </section>

      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
        <table className="w-full min-w-[760px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-3 py-2">Processed At</th>
              <th className="px-3 py-2">Event</th>
              <th className="px-3 py-2">Batch</th>
              <th className="px-3 py-2">Product</th>
              <th className="px-3 py-2">Quantity</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id} className="border-b border-slate-100">
                <td className="px-3 py-2">{event.processed_at ? new Date(event.processed_at).toLocaleString() : "-"}</td>
                <td className="px-3 py-2">{event.event_type}</td>
                <td className="px-3 py-2">
                  {event.batch_type} #{event.batch_id}
                  <div className="text-xs text-slate-500">{event.payload?.batch_number}</div>
                </td>
                <td className="px-3 py-2">{event.payload?.product}</td>
                <td className="px-3 py-2">{event.payload?.quantity}</td>
              </tr>
            ))}
            {events.length === 0 && (
              <tr>
                <td className="px-3 py-6 text-center text-slate-500" colSpan="5">
                  No completed production events yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
