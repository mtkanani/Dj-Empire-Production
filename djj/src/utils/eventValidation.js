/**
 * Frontend Validation Helpers for Event Wizard Steps matching backend Zod schemas
 */

export const validateBasicInfo = (data) => {
  const errors = {};

  if (!data.title || !data.title.trim()) {
    errors.title = 'Event title is required';
  }

  if (data.price !== undefined && Number(data.price) < 0) {
    errors.price = 'Price cannot be negative';
  }

  if (data.bannerUrl && data.bannerUrl.trim()) {
    try {
      const parsed = new URL(data.bannerUrl.trim());
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        errors.bannerUrl = 'Banner image must be a valid http(s) URL';
      }
    } catch {
      errors.bannerUrl = 'Enter a valid image URL (https://...)';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateVenue = (data) => {
  const errors = {};

  if (!data.venueName || !data.venueName.trim()) {
    errors.venueName = 'Venue name is required';
  }

  if (!data.address || !data.address.trim()) {
    errors.address = 'Address is required';
  }

  if (!data.city || !data.city.trim()) {
    errors.city = 'City is required';
  }

  if (data.capacity !== undefined && Number(data.capacity) <= 0) {
    errors.capacity = 'Capacity must be positive';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateSchedule = (data) => {
  const errors = {};

  if (!data.startDate) {
    errors.startDate = 'Start date is required';
  }

  if (!data.endDate) {
    errors.endDate = 'End date is required';
  }

  if (!data.startTime) {
    errors.startTime = 'Start time is required (e.g. 18:00)';
  }

  if (!data.endTime) {
    errors.endTime = 'End time is required (e.g. 22:00)';
  }

  if (data.startDate && data.endDate) {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    if (end < start) {
      errors.endDate = 'End date must be greater than or equal to Start date';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateFAQItem = (faq) => {
  const errors = {};
  if (!faq.question || !faq.question.trim()) {
    errors.question = 'Question is required';
  }
  if (!faq.answer || !faq.answer.trim()) {
    errors.answer = 'Answer is required';
  }
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateSEO = (data) => {
  const errors = {};

  if (data.canonicalUrl && data.canonicalUrl.trim()) {
    try {
      new URL(data.canonicalUrl);
    } catch {
      errors.canonicalUrl = 'Must be a valid URL';
    }
  }

  if (data.ogImage && data.ogImage.trim()) {
    try {
      new URL(data.ogImage);
    } catch {
      errors.ogImage = 'Must be a valid URL';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
