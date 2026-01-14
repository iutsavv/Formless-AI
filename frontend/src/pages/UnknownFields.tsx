import { useState, useEffect } from 'react';
import { api, UnknownField } from '../api/client';
import toast from 'react-hot-toast';
import {
    FileQuestion,
    Globe,
    Save,
    Trash2,
    Search,
    AlertCircle,
} from 'lucide-react';
import Navbar from '../components/Navbar';

export default function UnknownFields() {
    const [fields, setFields] = useState<UnknownField[]>([]);
    const [groupedFields, setGroupedFields] = useState<Record<string, UnknownField[]>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [editedValues, setEditedValues] = useState<Record<string, string>>({});
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadFields();
    }, []);

    const loadFields = async () => {
        const { data, error } = await api.getUnknownFields();
        if (data) {
            setFields(data.fields);
            setGroupedFields(data.groupedByDomain);

            // Initialize edited values
            const values: Record<string, string> = {};
            data.fields.forEach((field) => {
                values[field.id] = field.userValue || '';
            });
            setEditedValues(values);
        }
        setIsLoading(false);
    };

    const handleValueChange = (fieldId: string, value: string) => {
        setEditedValues((prev) => ({ ...prev, [fieldId]: value }));
    };

    const handleSaveField = async (fieldId: string) => {
        setIsSaving(true);
        const { error } = await api.updateFieldValue(fieldId, editedValues[fieldId] || null);
        setIsSaving(false);

        if (error) {
            toast.error(error);
        } else {
            toast.success('Field value saved!');
            // Update local state
            setFields((prev) =>
                prev.map((f) =>
                    f.id === fieldId ? { ...f, userValue: editedValues[fieldId] } : f
                )
            );
        }
    };

    const handleDeleteField = async (fieldId: string) => {
        if (!confirm('Are you sure you want to delete this field?')) return;

        const { error } = await api.deleteField(fieldId);
        if (error) {
            toast.error(error);
        } else {
            toast.success('Field deleted');
            setFields((prev) => prev.filter((f) => f.id !== fieldId));
            // Update grouped fields
            const newGrouped: Record<string, UnknownField[]> = {};
            Object.keys(groupedFields).forEach((domain) => {
                const filtered = groupedFields[domain].filter((f) => f.id !== fieldId);
                if (filtered.length > 0) {
                    newGrouped[domain] = filtered;
                }
            });
            setGroupedFields(newGrouped);
        }
    };

    const handleSaveAll = async () => {
        setIsSaving(true);
        const updates = Object.entries(editedValues).map(([id, userValue]) => ({
            id,
            userValue: userValue || null,
        }));

        const { error } = await api.bulkUpdateFields(updates);
        setIsSaving(false);

        if (error) {
            toast.error(error);
        } else {
            toast.success('All fields saved!');
            loadFields();
        }
    };

    const filteredGroupedFields = () => {
        if (!searchQuery) return groupedFields;

        const filtered: Record<string, UnknownField[]> = {};
        Object.keys(groupedFields).forEach((domain) => {
            const matchedFields = groupedFields[domain].filter(
                (field) =>
                    field.fieldName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    field.fieldLabel?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    domain.toLowerCase().includes(searchQuery.toLowerCase())
            );
            if (matchedFields.length > 0) {
                filtered[domain] = matchedFields;
            }
        });
        return filtered;
    };

    const totalFields = fields.length;
    const filledFields = fields.filter((f) => f.userValue).length;
    const unfilledFields = totalFields - filledFields;

    if (isLoading) {
        return (
            <>
                <Navbar />
                <div className="loading-overlay">
                    <div className="loading-spinner" />
                    <p>Loading unknown fields...</p>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="page">
                <div className="container">
                    <div className="page-header">
                        <h1 className="page-title">Unknown Fields</h1>
                        <p className="page-description">
                            These are form fields that were detected on job application sites but couldn't be auto-filled.
                            Provide values here and they'll be used next time.
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon purple">
                                <FileQuestion size={24} />
                            </div>
                            <div>
                                <div className="stat-value">{totalFields}</div>
                                <div className="stat-label">Total Fields</div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon green">
                                <Save size={24} />
                            </div>
                            <div>
                                <div className="stat-value">{filledFields}</div>
                                <div className="stat-label">Filled</div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon orange">
                                <AlertCircle size={24} />
                            </div>
                            <div>
                                <div className="stat-value">{unfilledFields}</div>
                                <div className="stat-label">Need Input</div>
                            </div>
                        </div>
                    </div>

                    {totalFields === 0 ? (
                        <div className="card empty-state">
                            <FileQuestion size={48} className="empty-state-icon" />
                            <h3>No Unknown Fields Yet</h3>
                            <p style={{ marginTop: 'var(--spacing-sm)' }}>
                                When you use the browser extension to fill job forms, any unrecognized fields will appear here.
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Search & Actions */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-xl)', flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
                                <div style={{ position: 'relative', flex: '1', maxWidth: '400px' }}>
                                    <Search
                                        size={18}
                                        style={{
                                            position: 'absolute',
                                            left: '1rem',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            color: 'var(--text-muted)',
                                        }}
                                    />
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Search fields..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        style={{ paddingLeft: '2.75rem' }}
                                    />
                                </div>
                                <button
                                    onClick={handleSaveAll}
                                    className="btn btn-primary"
                                    disabled={isSaving}
                                >
                                    {isSaving ? (
                                        <>
                                            <div className="loading-spinner" style={{ width: '1rem', height: '1rem' }} />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={18} />
                                            Save All Changes
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Fields by Domain */}
                            {Object.keys(filteredGroupedFields()).map((domain) => (
                                <div key={domain} className="domain-group animate-fade-in">
                                    <div className="domain-header">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                                            <Globe size={16} />
                                            <span className="domain-name">{domain}</span>
                                        </div>
                                        <span className="domain-count">
                                            {filteredGroupedFields()[domain].length} field(s)
                                        </span>
                                    </div>
                                    <div className="card" style={{ borderRadius: '0 0 var(--radius-lg) var(--radius-lg)', marginTop: '-1px' }}>
                                        <table className="fields-table">
                                            <thead>
                                                <tr>
                                                    <th>Field Name</th>
                                                    <th>Label / Placeholder</th>
                                                    <th>Type</th>
                                                    <th>Your Value</th>
                                                    <th style={{ width: '100px' }}>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredGroupedFields()[domain].map((field) => (
                                                    <tr key={field.id}>
                                                        <td>
                                                            <code style={{
                                                                fontSize: '0.8125rem',
                                                                background: 'var(--bg-secondary)',
                                                                padding: '0.25rem 0.5rem',
                                                                borderRadius: 'var(--radius-sm)'
                                                            }}>
                                                                {field.fieldName}
                                                            </code>
                                                        </td>
                                                        <td style={{ color: 'var(--text-secondary)' }}>
                                                            {field.fieldLabel || field.placeholder || '-'}
                                                        </td>
                                                        <td>
                                                            <span className="badge badge-info">{field.fieldType}</span>
                                                        </td>
                                                        <td>
                                                            <input
                                                                type="text"
                                                                className="field-input"
                                                                placeholder="Enter value..."
                                                                value={editedValues[field.id] || ''}
                                                                onChange={(e) => handleValueChange(field.id, e.target.value)}
                                                            />
                                                        </td>
                                                        <td>
                                                            <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
                                                                <button
                                                                    onClick={() => handleSaveField(field.id)}
                                                                    className="btn btn-ghost btn-sm"
                                                                    title="Save this field"
                                                                    style={{ padding: '0.375rem' }}
                                                                >
                                                                    <Save size={16} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteField(field.id)}
                                                                    className="btn btn-ghost btn-sm"
                                                                    title="Delete this field"
                                                                    style={{ padding: '0.375rem', color: 'var(--error)' }}
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ))}
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
