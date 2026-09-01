import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Save, Eye, Rocket, AlertCircle, Check } from 'lucide-react';
import { C } from '../../../constants/theme.js';
import { eventService } from '../../../services/organizer/eventService.js';
import { getEventBannerUrl } from '../../../utils/eventImage.js';
import { categoryService } from '../../../services/admin/categoryService.js';
import { cityService } from '../../../services/admin/cityService.js';
import { venueService } from '../../../services/admin/venueService.js';
import { useToast } from '../../../hooks/useToast.js';

import { BasicInformationStep } from './steps/BasicInformationStep.jsx';
import { VenueStep } from './steps/VenueStep.jsx';
import { ScheduleStep } from './steps/ScheduleStep.jsx';
import { EventPoliciesStep } from './steps/EventPoliciesStep.jsx';
import { FAQStep } from './steps/FAQStep.jsx';
import { SEOSettingsStep } from './steps/SEOSettingsStep.jsx';
import { EventPreviewStep } from './steps/EventPreviewStep.jsx';
import { PublishEventStep } from './steps/PublishEventStep.jsx';

import {
  validateBasicInfo,
  validateVenue,
  validateSchedule,
  validateSEO,
} from '../../../utils/eventValidation.js';

const WIZARD_STEPS = [
  { id: 1, label: 'Basic Info' },
  { id: 2, label: 'Venue' },
  { id: 3, label: 'Schedule' },
  { id: 4, label: 'Policies' },
  { id: 5, label: 'FAQ' },
  { id: 6, label: 'SEO' },
  { id: 7, label: 'Preview' },
  { id: 8, label: 'Publish' },
];

export const EventWizard = ({ existingEvent = null, isEditMode = false }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [eventId, setEventId] = useState(existingEvent?.id || null);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [globalError, setGlobalError] = useState(null);

  // Master Data State
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [venues, setVenues] = useState([]);

  // Form State
  const [basicInfo, setBasicInfo] = useState({
    title: existingEvent?.title || '',
    shortDescription: existingEvent?.shortDescription || '',
    description: existingEvent?.description || '',
    categoryId: existingEvent?.categoryId || null,
    cityId: existingEvent?.cityId || null,
    venueId: existingEvent?.venueId || null,
    eventType: existingEvent?.eventType || 'IN_PERSON',
    visibility: existingEvent?.visibility || 'PUBLIC',
    language: existingEvent?.language || 'English',
    currency: existingEvent?.currency || 'INR',
    timezone: existingEvent?.timezone || 'Asia/Kolkata',
    price: existingEvent?.price || 0.0,
    bannerUrl: getEventBannerUrl(existingEvent) || '',
  });

  const [venueData, setVenueData] = useState({
    venueName: existingEvent?.eventVenue?.venueName || existingEvent?.venue?.name || '',
    address: existingEvent?.eventVenue?.address || existingEvent?.venue?.address || '',
    city: existingEvent?.eventVenue?.city || existingEvent?.city?.name || '',
    state: existingEvent?.eventVenue?.state || '',
    country: existingEvent?.eventVenue?.country || 'India',
    capacity: existingEvent?.eventVenue?.capacity || 100,
    parkingAvailable: existingEvent?.eventVenue?.parkingAvailable || false,
    wheelchairAccessible: existingEvent?.eventVenue?.wheelchairAccessible ?? true,
    foodAllowed: existingEvent?.eventVenue?.foodAllowed || false,
    smokingAllowed: existingEvent?.eventVenue?.smokingAllowed || false,
  });

  const [scheduleData, setScheduleData] = useState({
    startDate: existingEvent?.schedules?.[0]?.startDate
      ? new Date(existingEvent.schedules[0].startDate).toISOString().split('T')[0]
      : existingEvent?.startDate
      ? new Date(existingEvent.startDate).toISOString().split('T')[0]
      : '',
    endDate: existingEvent?.schedules?.[0]?.endDate
      ? new Date(existingEvent.schedules[0].endDate).toISOString().split('T')[0]
      : '',
    startTime: existingEvent?.schedules?.[0]?.startTime || '18:00',
    endTime: existingEvent?.schedules?.[0]?.endTime || '22:00',
    gateOpenTime: existingEvent?.schedules?.[0]?.gateOpenTime || '17:00',
    timezone: existingEvent?.timezone || 'Asia/Kolkata',
  });

  const [policyData, setPolicyData] = useState({
    refundPolicy: existingEvent?.policy?.refundPolicy || '',
    cancellationPolicy: existingEvent?.policy?.cancellationPolicy || '',
    entryPolicy: existingEvent?.policy?.entryPolicy || '',
    cameraPolicy: existingEvent?.policy?.cameraPolicy || '',
    idProofRequired: existingEvent?.policy?.idProofRequired ?? true,
  });

  const [faqs, setFaqs] = useState(existingEvent?.faqs || []);

  const [seoData, setSeoData] = useState({
    metaTitle: existingEvent?.seo?.metaTitle || '',
    metaDescription: existingEvent?.seo?.metaDescription || '',
    keywords: existingEvent?.seo?.keywords || [],
    canonicalUrl: existingEvent?.seo?.canonicalUrl || '',
    ogImage: existingEvent?.seo?.ogImage || '',
  });

  const [stepErrors, setStepErrors] = useState({});

  // Load Master Data
  useEffect(() => {
    const loadMasterData = async () => {
      try {
        const [catRes, cityRes, venRes] = await Promise.allSettled([
          categoryService.getCategories(),
          cityService.getCities(),
          venueService.getVenues(),
        ]);

        if (catRes.status === 'fulfilled') {
          const raw = catRes.value?.data || catRes.value || [];
          setCategories(Array.isArray(raw) ? raw : []);
        }
        if (cityRes.status === 'fulfilled') {
          const raw = cityRes.value?.data || cityRes.value || [];
          setCities(Array.isArray(raw) ? raw : []);
        }
        if (venRes.status === 'fulfilled') {
          const raw = venRes.value?.data || venRes.value || [];
          setVenues(Array.isArray(raw) ? raw : []);
        }
      } catch {
        // Fallback gracefully
      }
    };
    loadMasterData();
  }, []);

  // Save Event Draft Core
  const handleSaveDraft = async () => {
    setSaving(true);
    setGlobalError(null);

    try {
      let currentId = eventId;

      if (!currentId) {
        // Create initial draft
        const res = await eventService.createEvent({
          title: basicInfo.title || 'Untitled Draft Event',
          shortDescription: basicInfo.shortDescription,
          description: basicInfo.description,
          categoryId: basicInfo.categoryId,
          cityId: basicInfo.cityId,
          venueId: basicInfo.venueId,
          eventType: basicInfo.eventType,
          visibility: basicInfo.visibility,
          price: basicInfo.price,
        });
        const created = res.data || res;
        currentId = created.id;
        setEventId(currentId);
      } else {
        // Update existing event
        await eventService.updateEvent(currentId, {
          title: basicInfo.title,
          shortDescription: basicInfo.shortDescription,
          description: basicInfo.description,
          categoryId: basicInfo.categoryId,
          cityId: basicInfo.cityId,
          venueId: basicInfo.venueId,
          eventType: basicInfo.eventType,
          visibility: basicInfo.visibility,
          price: basicInfo.price,
        });
      }

      // Save Sub-resources if currentId exists
      if (currentId) {
        const subRequests = [];
        if (venueData.venueName && venueData.city && venueData.address) {
          subRequests.push(eventService.upsertVenue(currentId, venueData));
        }
        if (scheduleData.startDate && scheduleData.endDate) {
          subRequests.push(eventService.addSchedule(currentId, scheduleData));
        }
        if (policyData.refundPolicy || policyData.entryPolicy) {
          subRequests.push(eventService.upsertPolicy(currentId, policyData));
        }
        if (seoData.metaTitle || seoData.metaDescription) {
          subRequests.push(eventService.upsertSEO(currentId, seoData));
        }

        const results = await Promise.allSettled(subRequests);
        const failed = results.find((r) => r.status === 'rejected');
        if (failed) {
          throw new Error(failed.reason?.message || 'Failed to save event details');
        }

        const bannerUrl = (basicInfo.bannerUrl || '').trim();
        if (bannerUrl) {
          await eventService.addImage(currentId, { type: 'BANNER', imageUrl: bannerUrl });
        }
      }

      showToast('Event draft saved successfully', 'success');
      return currentId;
    } catch (err) {
      setGlobalError(err.message || 'Failed to save event draft');
      showToast(err.message || 'Failed to save event draft', 'error');
      return null;
    } finally {
      setSaving(false);
    }
  };

  // Step Next Navigation
  const handleNext = async () => {
    let validation = { isValid: true, errors: {} };

    if (currentStep === 1) validation = validateBasicInfo(basicInfo);
    if (currentStep === 2) validation = validateVenue(venueData);
    if (currentStep === 3) validation = validateSchedule(scheduleData);
    if (currentStep === 6) validation = validateSEO(seoData);

    if (!validation.isValid) {
      setStepErrors(validation.errors);
      return;
    }

    setStepErrors({});

    // Auto-save draft as organizer progresses
    if (!eventId && currentStep === 1) {
      await handleSaveDraft();
    }

    setCurrentStep((prev) => Math.min(8, prev + 1));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  // Submit Approval Action
  const handleSubmitApproval = async () => {
    const savedId = eventId || (await handleSaveDraft());
    if (!savedId) return;

    setPublishing(true);
    try {
      await eventService.submitForApproval(savedId);
      showToast('Event submitted for Super Admin approval!', 'success');
      navigate('/organizer/events');
    } catch (err) {
      setGlobalError(err.message || 'Failed to submit event for approval');
      showToast(err.message || 'Submission failed', 'error');
    } finally {
      setPublishing(false);
    }
  };

  // Publish Live Action
  const handlePublishLive = async () => {
    const savedId = eventId || (await handleSaveDraft());
    if (!savedId) return;

    setPublishing(true);
    try {
      await eventService.publishEvent(savedId);
      showToast('Event published live successfully!', 'success');
      navigate('/organizer/events');
    } catch (err) {
      setGlobalError(err.message || 'Failed to publish event');
      showToast(err.message || 'Publishing failed', 'error');
    } finally {
      setPublishing(false);
    }
  };

  // FAQ Handlers
  const handleAddFAQ = async (faq) => {
    setFaqs((prev) => [...prev, faq]);
    if (eventId) {
      try {
        await eventService.addFAQ(eventId, faq);
      } catch {
        // Handled locally
      }
    }
  };

  const handleUpdateFAQ = async (id, updated) => {
    setFaqs((prev) => prev.map((f, i) => (f.id === id || i === id ? { ...f, ...updated } : f)));
    if (eventId && id) {
      try {
        await eventService.updateFAQ(id, updated);
      } catch {
        // Handled locally
      }
    }
  };

  const handleDeleteFAQ = async (id) => {
    setFaqs((prev) => prev.filter((f, i) => f.id !== id && i !== id));
    if (eventId && id) {
      try {
        await eventService.deleteFAQ(id);
      } catch {
        // Handled locally
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      {/* Wizard Progress Stepper */}
      <div
        style={{
          background: C.bgCard,
          border: `1px solid ${C.border}`,
          borderRadius: '20px',
          padding: '16px 20px',
          overflowX: 'auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minWidth: '600px' }}>
          {WIZARD_STEPS.map((step) => {
            const isDone = currentStep > step.id;
            const isCurrent = currentStep === step.id;

            return (
              <React.Fragment key={step.id}>
                <div
                  onClick={() => isDone && setCurrentStep(step.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: isDone ? 'pointer' : 'default',
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: isDone ? C.green : isCurrent ? C.gold : 'rgba(255,255,255,0.05)',
                      color: isDone || isCurrent ? '#000000' : C.muted,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '13px',
                      fontFamily: 'Space Grotesk, sans-serif',
                    }}
                  >
                    {isDone ? <Check size={16} /> : step.id}
                  </div>
                  <span
                    style={{
                      fontSize: '13px',
                      fontFamily: 'Space Grotesk, sans-serif',
                      fontWeight: isCurrent ? 700 : 500,
                      color: isCurrent ? C.gold : isDone ? C.text : C.muted,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {step.label}
                  </span>
                </div>

                {step.id < WIZARD_STEPS.length && (
                  <div style={{ flexGrow: 1, height: '2px', background: isDone ? C.green : C.border, margin: '0 8px' }} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Global Error Banner */}
      {globalError && (
        <div
          style={{
            padding: '14px 20px',
            background: C.redDim,
            border: `1px solid ${C.red}`,
            borderRadius: '14px',
            color: C.red,
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <AlertCircle size={18} /> {globalError}
        </div>
      )}

      {/* Active Step Content Container */}
      <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '20px', padding: '28px' }}>
        {currentStep === 1 && (
          <BasicInformationStep
            data={basicInfo}
            onChange={(fields) => setBasicInfo((p) => ({ ...p, ...fields }))}
            categories={categories}
            cities={cities}
            venues={venues}
            onCategoryCreated={(cat) => setCategories((prev) => [...prev, cat])}
            onCityCreated={(city) => setCities((prev) => [...prev, city])}
            onVenueCreated={(ven) => setVenues((prev) => [...prev, ven])}
            errors={stepErrors}
          />
        )}

        {currentStep === 2 && (
          <VenueStep
            data={venueData}
            onChange={(fields) => setVenueData((p) => ({ ...p, ...fields }))}
            errors={stepErrors}
          />
        )}

        {currentStep === 3 && (
          <ScheduleStep
            data={scheduleData}
            onChange={(fields) => setScheduleData((p) => ({ ...p, ...fields }))}
            errors={stepErrors}
          />
        )}

        {currentStep === 4 && (
          <EventPoliciesStep
            data={policyData}
            onChange={(fields) => setPolicyData((p) => ({ ...p, ...fields }))}
          />
        )}

        {currentStep === 5 && (
          <FAQStep
            faqs={faqs}
            onAddFAQ={handleAddFAQ}
            onUpdateFAQ={handleUpdateFAQ}
            onDeleteFAQ={handleDeleteFAQ}
          />
        )}

        {currentStep === 6 && (
          <SEOSettingsStep
            data={seoData}
            onChange={(fields) => setSeoData((p) => ({ ...p, ...fields }))}
            errors={stepErrors}
          />
        )}

        {currentStep === 7 && (
          <EventPreviewStep
            basicInfo={basicInfo}
            venue={venueData}
            schedule={scheduleData}
            policy={policyData}
            faqs={faqs}
            seo={seoData}
          />
        )}

        {currentStep === 8 && (
          <PublishEventStep
            event={existingEvent}
            basicInfo={basicInfo}
            venue={venueData}
            schedule={scheduleData}
            onPublish={handlePublishLive}
            onSubmitApproval={handleSubmitApproval}
            onSaveDraft={handleSaveDraft}
            publishing={publishing}
            saving={saving}
          />
        )}
      </div>

      {/* Wizard Footer Controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: C.bgCard,
          border: `1px solid ${C.border}`,
          borderRadius: '16px',
          padding: '16px 24px',
        }}
      >
        <button
          onClick={handleBack}
          disabled={currentStep === 1 || saving || publishing}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '10px 18px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: `1px solid ${C.border}`,
            borderRadius: '12px',
            color: C.text,
            fontWeight: 600,
            fontSize: '13px',
            cursor: currentStep === 1 ? 'not-allowed' : 'pointer',
            opacity: currentStep === 1 ? 0.4 : 1,
          }}
        >
          <ChevronLeft size={16} /> Back
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={handleSaveDraft}
            disabled={saving || publishing}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 18px',
              background: C.goldDim,
              border: `1px solid ${C.borderGold}`,
              borderRadius: '12px',
              color: C.gold,
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            <Save size={15} /> {saving ? 'Saving...' : 'Save Draft'}
          </button>

          {currentStep < 8 && (
            <button
              onClick={handleNext}
              disabled={saving || publishing}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 22px',
                background: C.gold,
                color: '#000000',
                border: 'none',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '13px',
                fontFamily: 'Space Grotesk, sans-serif',
                cursor: 'pointer',
              }}
            >
              Next <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
