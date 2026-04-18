import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import EventCard from "../components/EventCard.jsx";
import Loading from "../components/Loading.jsx";
import SectionHeader from "../components/common/SectionHeader.jsx";
import PageWrapper from "../components/common/PageWrapper.jsx";
import { publicAPI } from "../lib/api.js";
import { useDepartment } from "../../department/DepartmentContext";

const Events = () => {
  const { deptPath } = useDepartment();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const limit = 6;

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const res = await publicAPI.getEvents({ page, limit });
        setEvents(res.data.data || []);
      } catch (error) {
        console.error("Failed to fetch events", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [page]);

  if (loading) return <Loading />;

  return (
    <PageWrapper>
      <section className="container mx-auto px-4 py-16">
        <SectionHeader title="Events" />

        {events.length > 0 ? (
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            {events.map((event) => (
              <Link key={event.id} to={deptPath(`/events/${event.id}`)} className="block">
                <EventCard event={event} />
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-10 text-center text-gray-500">No events available.</div>
        )}

        <div className="mt-16 flex items-center justify-center gap-4">
          <button
            disabled={page === 1}
            onClick={() => setPage((current) => current - 1)}
            className="rounded border px-4 py-2 disabled:opacity-40"
          >
            Prev
          </button>

          <span className="rounded bg-[#8B0000] px-4 py-2 text-white">{page}</span>

          <button
            onClick={() => setPage((current) => current + 1)}
            className="rounded border px-4 py-2"
          >
            Next
          </button>
        </div>
      </section>
    </PageWrapper>
  );
};

export default Events;
