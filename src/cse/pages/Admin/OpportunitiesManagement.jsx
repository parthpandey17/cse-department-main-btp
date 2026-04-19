import { useEffect, useState } from "react";
import { adminAPI } from "../../lib/api.js";

const EMPTY_FORM = {
  title: "",
  page_group: "general",
  block_type: "rich_text",
  subtitle: "",
  description: "",
  cta_text: "",
  cta_url: "",
  content_html: "",
  display_order: 0,
  is_active: true,
};

export default function OpportunitiesManagement() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    fetchItems();
  }, []);

  // close modal on Escape
  useEffect(() => {
    if (!showModal) return;
    const onKey = (e) => { if (e.key === 'Escape') closeModal(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showModal]);

  const fetchItems = async () => {
    try {
      const response = await adminAPI.getOpportunities();
      setItems(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch opportunities", error);
      alert("Failed to fetch opportunities");
    } finally {
      setLoading(false);
    }
  };

  const openModal = (item = null) => {
    setEditingItem(item);
    setFormData(item ? { ...EMPTY_FORM, ...item } : EMPTY_FORM);
    setImageFile(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setEditingItem(null);
    setFormData(EMPTY_FORM);
    setImageFile(null);
    setShowModal(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const data = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, value ?? "");
    });

    if (imageFile) data.append("image", imageFile);

    try {
      if (editingItem) {
        await adminAPI.updateOpportunity(editingItem.id, data);
      } else {
        await adminAPI.createOpportunity(data);
      }

      await fetchItems();
      closeModal();
    } catch (error) {
      console.error("Failed to save opportunity", error);
      alert("Failed to save opportunity");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this opportunity block?")) return;

    try {
      await adminAPI.deleteOpportunity(id);
      await fetchItems();
    } catch (error) {
      console.error("Failed to delete opportunity", error);
      alert("Delete failed");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-lnmiit-red" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Opportunities Management</h1>
        <button className="btn-primary" onClick={() => openModal()}>
          Add Block
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg bg-white shadow">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Group</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Order</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {items.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4">{item.title}</td>
                <td className="px-6 py-4">{item.page_group}</td>
                <td className="px-6 py-4">{item.block_type}</td>
                <td className="px-6 py-4">{item.display_order}</td>
                <td className="space-x-2 px-6 py-4">
                  <button onClick={() => openModal(item)} className="text-blue-600">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="text-red-600">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 relative">
            <button type="button" onClick={closeModal} aria-label="Close modal" className="absolute top-3 right-3 text-gray-600 hover:text-gray-900">×</button>
            <h2 className="mb-4 text-xl font-bold">{editingItem ? "Edit Opportunity" : "Add Opportunity"}</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input label="Title" value={formData.title} onChange={(value) => setFormData({ ...formData, title: value })} required />
              <Input label="Subtitle" value={formData.subtitle} onChange={(value) => setFormData({ ...formData, subtitle: value })} />
              <Textarea label="Description" value={formData.description} onChange={(value) => setFormData({ ...formData, description: value })} />
              <Textarea label="Content HTML" value={formData.content_html} onChange={(value) => setFormData({ ...formData, content_html: value })} rows={6} />
              <Input label="CTA Text" value={formData.cta_text} onChange={(value) => setFormData({ ...formData, cta_text: value })} />
              <Input label="CTA URL" value={formData.cta_url} onChange={(value) => setFormData({ ...formData, cta_url: value })} />

              <div className="grid gap-4 md:grid-cols-3">
                <Select
                  label="Group"
                  value={formData.page_group}
                  onChange={(value) => setFormData({ ...formData, page_group: value })}
                  options={["general", "faculty", "research", "non_academic"]}
                />
                <Select
                  label="Block Type"
                  value={formData.block_type}
                  onChange={(value) => setFormData({ ...formData, block_type: value })}
                  options={["rich_text", "hero", "accordion", "table", "button_group", "links", "note"]}
                />
                <Input
                  label="Display Order"
                  type="number"
                  value={formData.display_order}
                  onChange={(value) => setFormData({ ...formData, display_order: value })}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Image</label>
                <input type="file" onChange={(event) => setImageFile(event.target.files?.[0] || null)} />
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={!!formData.is_active}
                  onChange={(event) => setFormData({ ...formData, is_active: event.target.checked })}
                />
                Active
              </label>

              <div className="flex gap-3">
                <button type="submit" className="btn-primary">{editingItem ? "Update" : "Create"}</button>
                <button type="button" onClick={closeModal} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Input({ label, value, onChange, required, type = "text" }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium">{label}</label>
      <input
        type={type}
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded border px-3 py-2"
        required={required}
      />
    </div>
  );
}

function Textarea({ label, value, onChange, rows = 4 }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium">{label}</label>
      <textarea
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded border px-3 py-2"
        rows={rows}
      />
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium">{label}</label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded border px-3 py-2"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
