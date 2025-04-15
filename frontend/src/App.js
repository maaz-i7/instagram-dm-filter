import React, { useState } from "react";
import axios from "axios";

export default function InstagramDMFilter() {
  const [file, setFile] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !startDate || !endDate) return alert("Please fill all fields");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("start_date", startDate);
    formData.append("end_date", endDate);

    try {
      setLoading(true);
      const res = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/upload`, formData);
      setMessages(res.data.messages);
    } catch (err) {
      alert("Error fetching messages");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Instagram DM Filter</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="file"
          accept=".zip"
          onChange={(e) => setFile(e.target.files[0])}
          className="block w-full border rounded p-2"
        />
        <div className="flex gap-4">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border rounded p-2 w-full"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border rounded p-2 w-full"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {loading ? "Loading..." : "Filter Messages"}
        </button>
      </form>

      <div className="mt-6">
        {messages.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Filtered Messages:</h2>
            <div className="border rounded p-4 max-h-[400px] overflow-y-scroll space-y-2">
              {messages.map((msg, idx) => (
                <div key={idx} className="border-b pb-2">
                  <div className="text-sm text-gray-500">{msg.timestamp} - <strong>{msg.sender}</strong></div>
                  <div>{msg.text}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
