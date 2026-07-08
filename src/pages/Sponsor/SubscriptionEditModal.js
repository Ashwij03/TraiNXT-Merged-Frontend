import React, { useState } from 'react';
import { MdClose } from 'react-icons/md';
import './SubscriptionEditModal.css';

const PLAN_OPTIONS = ['Basic', 'Professional', 'Enterprise'];
const STATUS_OPTIONS = ['Active', 'Expired', 'Suspended'];

const SubscriptionEditModal = ({ subscription, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    plan: subscription?.plan || 'Basic',
    status: subscription?.status || 'Active',
    startDate: subscription?.startDate || '',
    endDate: subscription?.endDate || '',
    maxUsers: subscription?.maxUsers ?? '',
    maxStudies: subscription?.maxStudies ?? '',
    storageLimit: subscription?.storageLimit ?? '',
    autoRenewal: subscription?.autoRenewal ?? false,
    notes: subscription?.notes || '',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.plan) newErrors.plan = 'Plan is required';
    if (!formData.status) newErrors.status = 'Status is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';

    if (formData.startDate && formData.endDate && formData.endDate < formData.startDate) {
      newErrors.endDate = 'End date must be on or after start date';
    }

    const maxUsers = Number(formData.maxUsers);
    if (formData.maxUsers === '' || formData.maxUsers === null || formData.maxUsers === undefined) {
      newErrors.maxUsers = 'Maximum users is required';
    } else if (Number.isNaN(maxUsers) || maxUsers <= 0) {
      newErrors.maxUsers = 'Maximum users must be greater than 0';
    }

    const maxStudies = Number(formData.maxStudies);
    if (formData.maxStudies === '' || formData.maxStudies === null || formData.maxStudies === undefined) {
      newErrors.maxStudies = 'Maximum studies is required';
    } else if (Number.isNaN(maxStudies) || maxStudies <= 0) {
      newErrors.maxStudies = 'Maximum studies must be greater than 0';
    }

    const storageLimit = Number(formData.storageLimit);
    if (formData.storageLimit === '' || formData.storageLimit === null || formData.storageLimit === undefined) {
      newErrors.storageLimit = 'Storage limit is required';
    } else if (Number.isNaN(storageLimit) || storageLimit <= 0) {
      newErrors.storageLimit = 'Storage limit must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    onSave({
      ...formData,
      maxUsers: Number(formData.maxUsers),
      maxStudies: Number(formData.maxStudies),
      storageLimit: Number(formData.storageLimit),
    });
  };

  const handleOverlayClick = () => {
    onClose();
  };

  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div className="subscription-modal-overlay" onClick={handleOverlayClick}>
      <div className="subscription-modal" onClick={handleModalClick}>
        <div className="subscription-modal-header">
          <h3>Edit Subscription</h3>
          <button type="button" className="subscription-modal-close" onClick={onClose}>
            <MdClose size={22} />
          </button>
        </div>

        <div className="subscription-modal-body">
          <div className="subscription-form-grid">
            <div className="subscription-form-group">
              <label>Plan *</label>
              <select
                value={formData.plan}
                onChange={(e) => handleChange('plan', e.target.value)}
              >
                {PLAN_OPTIONS.map((plan) => (
                  <option key={plan} value={plan}>{plan}</option>
                ))}
              </select>
              {errors.plan && <span className="subscription-field-error">{errors.plan}</span>}
            </div>

            <div className="subscription-form-group">
              <label>Status *</label>
              <select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              {errors.status && <span className="subscription-field-error">{errors.status}</span>}
            </div>

            <div className="subscription-form-group">
              <label>Start Date *</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => handleChange('startDate', e.target.value)}
              />
              {errors.startDate && <span className="subscription-field-error">{errors.startDate}</span>}
            </div>

            <div className="subscription-form-group">
              <label>End Date *</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => handleChange('endDate', e.target.value)}
              />
              {errors.endDate && <span className="subscription-field-error">{errors.endDate}</span>}
            </div>

            <div className="subscription-form-group">
              <label>Maximum Users *</label>
              <input
                type="number"
                min="1"
                value={formData.maxUsers}
                onChange={(e) => handleChange('maxUsers', e.target.value)}
              />
              {errors.maxUsers && <span className="subscription-field-error">{errors.maxUsers}</span>}
            </div>

            <div className="subscription-form-group">
              <label>Maximum Studies *</label>
              <input
                type="number"
                min="1"
                value={formData.maxStudies}
                onChange={(e) => handleChange('maxStudies', e.target.value)}
              />
              {errors.maxStudies && <span className="subscription-field-error">{errors.maxStudies}</span>}
            </div>

            <div className="subscription-form-group">
              <label>Storage Limit (GB) *</label>
              <input
                type="number"
                min="1"
                value={formData.storageLimit}
                onChange={(e) => handleChange('storageLimit', e.target.value)}
              />
              {errors.storageLimit && <span className="subscription-field-error">{errors.storageLimit}</span>}
            </div>

            <div className="subscription-form-group subscription-form-group-checkbox">
              <label>Auto Renewal</label>
              <input
                type="checkbox"
                checked={!!formData.autoRenewal}
                onChange={(e) => handleChange('autoRenewal', e.target.checked)}
              />
            </div>

            <div className="subscription-form-group subscription-form-group-wide">
              <label>Notes</label>
              <textarea
                rows={3}
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Add any notes about this subscription..."
              />
            </div>
          </div>
        </div>

        <div className="subscription-modal-footer">
          <button type="button" className="subscription-btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="subscription-btn-save" onClick={handleSave}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionEditModal;