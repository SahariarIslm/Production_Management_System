import { useEffect, useState } from "react";
import client from "../api/client";

export default function Inventory() {
  const [data, setData] = useState(null);

  useEffect(() => {
    client.get("/inventory").then((res) => setData(res.data));
  }, []);

  if (!data) return <p className="p-6">Loading...</p>;

  const Section = ({ title, items }) => (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <table className="w-full border text-left">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Name</th>
            <th className="p-2 border">SKU</th>
            <th className="p-2 border">Unit</th>
            <th className="p-2 border">Qty on Hand</th>
          </tr>
        </thead>
        <tbody>
          {items.map((i) => (
            <tr key={i.id}>
              <td className="p-2 border">{i.name}</td>
              <td className="p-2 border">{i.sku}</td>
              <td className="p-2 border">{i.unit}</td>
              <td className="p-2 border">{i.quantity_on_hand}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Current Inventory</h1>
      <Section title="Raw Materials" items={data.raw_materials} />
      <Section title="Semi-Finished Products" items={data.semi_finished_products} />
      <Section title="Finished Products" items={data.finished_products} />
    </div>
  );
}