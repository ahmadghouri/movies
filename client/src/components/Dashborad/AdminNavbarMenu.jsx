import React, { useEffect, useState, useCallback } from "react";
import axiosbase from "../../../axiosbasa";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { showSuccess, showError } from "../../lib/toast";
import {
  Plus,
  Trash2,
  PencilLine,
  Check,
  X,
  ChevronDown,
  ChevronRight,
  ToggleLeft,
  ToggleRight,
  GripVertical,
} from "lucide-react";

// ─── helpers ────────────────────────────────────────────────────────────────

const emptyItem = () => ({ label: "", order: 0, isActive: true, subItems: [] });
const emptySub  = () => ({ label: "", filterValue: "", order: 0, isActive: true });

// ─── Sub-item row (inside edit panel) ───────────────────────────────────────

const SubItemRow = ({ sub, idx, onChange, onRemove }) => (
  <div className="flex items-center gap-2 py-1.5 border-b border-gray-700 last:border-0">
    <GripVertical className="w-4 h-4 text-gray-500 shrink-0" />
    <Input
      placeholder="Label"
      value={sub.label}
      onChange={(e) => onChange(idx, "label", e.target.value)}
      className="h-7 text-xs flex-1 bg-gray-700 border-gray-600 text-white"
    />
    <Input
      placeholder="Filter value"
      value={sub.filterValue}
      onChange={(e) => onChange(idx, "filterValue", e.target.value)}
      className="h-7 text-xs flex-1 bg-gray-700 border-gray-600 text-white"
    />
    <Input
      type="number"
      placeholder="Order"
      value={sub.order}
      onChange={(e) => onChange(idx, "order", Number(e.target.value))}
      className="h-7 text-xs w-16 bg-gray-700 border-gray-600 text-white"
    />
    <button
      type="button"
      onClick={() => onChange(idx, "isActive", !sub.isActive)}
      title={sub.isActive ? "Active" : "Inactive"}
      className="text-gray-400 hover:text-white"
    >
      {sub.isActive
        ? <ToggleRight className="w-5 h-5 text-green-400" />
        : <ToggleLeft  className="w-5 h-5 text-gray-500" />}
    </button>
    <button
      type="button"
      onClick={() => onRemove(idx)}
      className="text-red-400 hover:text-red-300"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  </div>
);

// ─── Edit / Create panel ─────────────────────────────────────────────────────

const EditPanel = ({ item, onSave, onCancel, isSaving }) => {
  const [form, setForm] = useState(() => ({
    label:    item?.label    ?? "",
    order:    item?.order    ?? 0,
    isActive: item?.isActive ?? true,
    subItems: (item?.subItems ?? []).map((s) => ({ ...s })),
  }));

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubChange = (idx, key, val) => {
    setForm((f) => {
      const subs = [...f.subItems];
      subs[idx] = { ...subs[idx], [key]: val };
      return { ...f, subItems: subs };
    });
  };

  const addSub = () =>
    setForm((f) => ({
      ...f,
      subItems: [...f.subItems, { ...emptySub(), order: f.subItems.length }],
    }));

  const removeSub = (idx) =>
    setForm((f) => ({ ...f, subItems: f.subItems.filter((_, i) => i !== idx) }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.label.trim()) return showError("Label required.");
    onSave(form);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-800 rounded-lg p-5 border border-gray-700 space-y-4"
    >
      <h3 className="text-white font-semibold text-sm">
        {item?._id ? "Edit Menu Item" : "New Menu Item"}
      </h3>

      {/* Top-level fields */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[160px]">
          <label className="text-xs text-gray-400 mb-1 block">Label *</label>
          <Input
            value={form.label}
            onChange={(e) => setField("label", e.target.value)}
            placeholder="e.g. Bollywood"
            className="bg-gray-700 border-gray-600 text-white"
          />
        </div>
        <div className="w-24">
          <label className="text-xs text-gray-400 mb-1 block">Order</label>
          <Input
            type="number"
            value={form.order}
            onChange={(e) => setField("order", Number(e.target.value))}
            className="bg-gray-700 border-gray-600 text-white"
          />
        </div>
        <div className="flex items-end pb-1">
          <button
            type="button"
            onClick={() => setField("isActive", !form.isActive)}
            className="flex items-center gap-1.5 text-sm text-gray-300"
          >
            {form.isActive
              ? <ToggleRight className="w-6 h-6 text-green-400" />
              : <ToggleLeft  className="w-6 h-6 text-gray-500" />}
            {form.isActive ? "Active" : "Inactive"}
          </button>
        </div>
      </div>

      {/* Sub-items */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">
            Dropdown Sub-Items ({form.subItems.length})
          </span>
          <Button type="button" size="sm" variant="outline" onClick={addSub}
            className="h-7 text-xs border-gray-600 text-gray-300 hover:text-white">
            <Plus className="w-3 h-3 mr-1" /> Add Sub-Item
          </Button>
        </div>

        {form.subItems.length === 0 && (
          <p className="text-xs text-gray-500 italic">
            No sub-items — this button will act as a simple filter (no dropdown).
          </p>
        )}

        <div className="space-y-0.5 max-h-64 overflow-y-auto pr-1">
          {form.subItems.map((sub, i) => (
            <SubItemRow
              key={i}
              sub={sub}
              idx={i}
              onChange={handleSubChange}
              onRemove={removeSub}
            />
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <Button type="submit" size="sm" disabled={isSaving}
          className="bg-red-600 hover:bg-red-700 text-white">
          <Check className="w-4 h-4 mr-1" />
          {isSaving ? "Saving…" : "Save"}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onCancel}
          className="text-gray-400 hover:text-white">
          <X className="w-4 h-4 mr-1" /> Cancel
        </Button>
      </div>
    </form>
  );
};

// ─── Main page ───────────────────────────────────────────────────────────────

const AdminNavbarMenu = () => {
  const [items,    setItems]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [editing,  setEditing]  = useState(null);   // item being edited (or "new")
  const [creating, setCreating] = useState(false);  // show create panel
  const [saving,   setSaving]   = useState(false);
  const [expanded, setExpanded] = useState({});      // id → bool

  // ── Fetch ──────────────────────────────────────────────
  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosbase.get("/admin/navbar-menu");
      setItems(res.data?.data ?? []);
    } catch {
      showError("Failed to load navbar menu.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  // ── Toggle expand ──────────────────────────────────────
  const toggleExpand = (id) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  // ── Toggle active ──────────────────────────────────────
  const handleToggle = async (id) => {
    try {
      const res = await axiosbase.patch(`/admin/navbar-menu/${id}/toggle`);
      setItems((prev) =>
        prev.map((it) => (it._id === id ? res.data.data : it))
      );
      showSuccess("Visibility updated.");
    } catch {
      showError("Failed to toggle visibility.");
    }
  };

  // ── Delete ─────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this menu item?")) return;
    try {
      await axiosbase.delete(`/admin/navbar-menu/${id}`);
      setItems((prev) => prev.filter((it) => it._id !== id));
      showSuccess("Deleted.");
    } catch {
      showError("Failed to delete.");
    }
  };

  // ── Save (create or update) ────────────────────────────
  const handleSave = async (form) => {
    setSaving(true);
    try {
      if (editing === "new") {
        const res = await axiosbase.post("/admin/navbar-menu", form);
        setItems((prev) => [...prev, res.data.data]);
        showSuccess("Menu item created.");
        setCreating(false);
        setEditing(null);
      } else {
        const res = await axiosbase.put(`/admin/navbar-menu/${editing._id}`, form);
        setItems((prev) =>
          prev.map((it) => (it._id === editing._id ? res.data.data : it))
        );
        showSuccess("Menu item updated.");
        setEditing(null);
      }
    } catch {
      showError("Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const startCreate = () => {
    setEditing("new");
    setCreating(true);
  };

  const cancelEdit = () => {
    setEditing(null);
    setCreating(false);
  };

  // ── Render ─────────────────────────────────────────────
  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Navbar Menu</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Manage top-level buttons and their hover dropdowns.
          </p>
        </div>
        {!creating && (
          <Button
            onClick={startCreate}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <Plus className="w-4 h-4 mr-1.5" /> New Item
          </Button>
        )}
      </div>

      {/* Create panel */}
      {creating && editing === "new" && (
        <div className="mb-6">
          <EditPanel
            item={emptyItem()}
            onSave={handleSave}
            onCancel={cancelEdit}
            isSaving={saving}
          />
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          No menu items yet. Click "New Item" to add one.
        </div>
      ) : (
        <div className="space-y-3">
          {items
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((item) => {
              const isExpanded = !!expanded[item._id];
              const isEditing  = editing?._id === item._id;

              return (
                <div
                  key={item._id}
                  className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden"
                >
                  {/* Item row */}
                  <div className="flex items-center gap-3 px-4 py-3">
                    {/* Expand toggle */}
                    <button
                      onClick={() => toggleExpand(item._id)}
                      className="text-gray-400 hover:text-white"
                      title={isExpanded ? "Collapse" : "Expand sub-items"}
                    >
                      {isExpanded
                        ? <ChevronDown  className="w-4 h-4" />
                        : <ChevronRight className="w-4 h-4" />}
                    </button>

                    {/* Label + meta */}
                    <div className="flex-1 min-w-0">
                      <span
                        className={`font-medium text-sm ${
                          item.isActive ? "text-white" : "text-gray-500 line-through"
                        }`}
                      >
                        {item.label}
                      </span>
                      <span className="ml-2 text-xs text-gray-500">
                        order: {item.order}
                      </span>
                      {item.subItems?.length > 0 && (
                        <span className="ml-2 text-xs bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded">
                          {item.subItems.length} sub-item{item.subItems.length !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      {/* Active toggle */}
                      <button
                        onClick={() => handleToggle(item._id)}
                        title={item.isActive ? "Click to hide" : "Click to show"}
                        className="p-1.5 rounded hover:bg-gray-700"
                      >
                        {item.isActive
                          ? <ToggleRight className="w-5 h-5 text-green-400" />
                          : <ToggleLeft  className="w-5 h-5 text-gray-500" />}
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => { setEditing(item); setCreating(false); }}
                        className="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-white"
                        title="Edit"
                      >
                        <PencilLine className="w-4 h-4" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="p-1.5 rounded hover:bg-gray-700 text-red-400 hover:text-red-300"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Edit panel (inline) */}
                  {isEditing && !creating && (
                    <div className="px-4 pb-4 border-t border-gray-700 pt-4">
                      <EditPanel
                        item={item}
                        onSave={handleSave}
                        onCancel={cancelEdit}
                        isSaving={saving}
                      />
                    </div>
                  )}

                  {/* Sub-items preview (read-only expand) */}
                  {isExpanded && !isEditing && item.subItems?.length > 0 && (
                    <div className="px-4 pb-3 border-t border-gray-700">
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {item.subItems
                          .slice()
                          .sort((a, b) => a.order - b.order)
                          .map((s, i) => (
                            <span
                              key={i}
                              className={`text-xs px-2 py-0.5 rounded ${
                                s.isActive
                                  ? "bg-gray-700 text-gray-200"
                                  : "bg-gray-800 text-gray-500 line-through border border-gray-700"
                              }`}
                            >
                              {s.label}
                              <span className="ml-1 text-gray-500">
                                ({s.filterValue})
                              </span>
                            </span>
                          ))}
                      </div>
                    </div>
                  )}

                  {isExpanded && !isEditing && item.subItems?.length === 0 && (
                    <div className="px-4 pb-3 border-t border-gray-700 pt-2">
                      <p className="text-xs text-gray-500 italic">No sub-items.</p>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      )}
    </main>
  );
};

export default AdminNavbarMenu;
