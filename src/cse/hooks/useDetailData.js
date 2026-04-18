import { useEffect, useState } from "react";

export default function useDetailData(fetcher, id) {
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await fetcher(id);
        setItem(response?.data?.data || null);
      } catch (err) {
        console.error(err);
        setError("Failed to load detail.");
      } finally {
        setLoading(false);
      }
    };

    if (id) load();
  }, [fetcher, id]);

  return { item, loading, error };
}
