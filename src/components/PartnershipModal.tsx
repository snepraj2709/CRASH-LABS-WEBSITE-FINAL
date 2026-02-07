import React, { useState } from 'react';
import { X, Send, Building2, Mail, MessageSquare, CheckCircle, AlertCircle } from 'lucide-react';
import { useGoogleForm } from '../hooks/useGoogleForm';

interface PartnershipModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PartnershipModal: React.FC<PartnershipModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    idea: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Use Google Sheets integration with specific sheet name
  const { submit, loading, error, success } = useGoogleForm({ sheetName: 'Industry Partnership Responses' });

  // Common personal email domains to block
  const personalDomains = [
    'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'live.com',
    'icloud.com', 'me.com', 'aol.com', 'protonmail.com', 'mail.com',
    'zoho.com', 'yandex.com', 'gmx.com', 'inbox.com', 'fastmail.com'
  ];

  const isWorkEmail = (email: string): boolean => {
    const domain = email.split('@')[1]?.toLowerCase();
    if (!domain) return false;
    return !personalDomains.includes(domain);
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    } else if (!isWorkEmail(formData.email)) {
      newErrors.email = 'Please use your work email address';
    }

    if (!formData.idea.trim()) {
      newErrors.idea = 'Please describe your collaboration idea';
    } else if (formData.idea.trim().length < 20) {
      newErrors.idea = 'Please provide more details (at least 20 characters)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Extract organization from email domain
    const organization = formData.email.split('@')[1];

    // Submit to Google Sheets
    const result = await submit({
      ...formData,
      organization
    });

    // Reset form on success (success state is managed by useGoogleForm)
    if (result.success) {
      setTimeout(() => {
        setFormData({ name: '', email: '', idea: '' });
      }, 2000);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleClose = () => {
    setFormData({ name: '', email: '', idea: '' });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-navy-900/80 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-paper rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-navy-900 transition-colors z-10"
        >
          <X size={20} />
        </button>

        {success ? (
          /* Success State */
          <div className="p-8 md:p-12 text-center">
            <div className="w-16 h-16 bg-brand-blue/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-brand-blue" />
            </div>
            <h3 className="text-2xl font-serif font-semibold text-navy-900 mb-3">
              Thank You!
            </h3>
            <p className="text-gray-600 mb-8">
              We've received your partnership inquiry and will get back to you within 2-3 business days.
            </p>
            <button
              onClick={handleClose}
              className="px-8 py-3 bg-navy-900 text-white font-medium rounded-full hover:bg-brand-blue transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          /* Form */
          <>
            {/* Header */}
            <div className="p-8 pb-0 md:p-12 md:pb-0">
              <div className="flex items-center gap-3 mb-2">
                <Building2 className="w-5 h-5 text-brand-blue" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-blue">
                  Industry Partnership
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-serif font-semibold text-navy-900 mb-2">
                Let's Collaborate
              </h2>
              <p className="text-gray-600 text-sm">
                Interested in partnering with CRASH Lab? Tell us about your organization and ideas.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-8 md:p-12 pt-6 md:pt-8 space-y-5">
              {/* Name Field */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  Your Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Smith"
                    className={`w-full px-4 py-3 bg-white border rounded-lg text-navy-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-colors ${errors.name ? 'border-red-400' : 'border-gray-200'
                      }`}
                  />
                </div>
                {errors.name && (
                  <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle size={12} />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  Work Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@company.com"
                    className={`w-full pl-11 pr-4 py-3 bg-white border rounded-lg text-navy-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-colors ${errors.email ? 'border-red-400' : 'border-gray-200'
                      }`}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle size={12} />
                    {errors.email}
                  </p>
                )}
                <p className="mt-1.5 text-[10px] text-gray-400">
                  Please use your organization email (not personal)
                </p>
              </div>

              {/* Collaboration Idea Field */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  Collaboration Idea
                </label>
                <div className="relative">
                  <MessageSquare className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                  <textarea
                    name="idea"
                    value={formData.idea}
                    onChange={handleChange}
                    placeholder="Describe your organization and how you'd like to collaborate with CRASH Lab..."
                    rows={4}
                    className={`w-full pl-11 pr-4 py-3 bg-white border rounded-lg text-navy-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-colors resize-none ${errors.idea ? 'border-red-400' : 'border-gray-200'
                      }`}
                  />
                </div>
                {errors.idea && (
                  <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle size={12} />
                    {errors.idea}
                  </p>
                )}
              </div>

              {/* Error Display */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-lg flex items-center gap-3 text-red-600">
                  <AlertCircle size={20} />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-navy-900 text-white font-semibold rounded-full hover:bg-brand-blue transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Inquiry
                    <Send size={18} />
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default PartnershipModal;

