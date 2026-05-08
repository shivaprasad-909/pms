// ============================================
// Express v5 Type Augmentation
// ============================================
// In Express v5, req.params values are string | string[].
// This provides a helper to safely extract string params.

export const p = (val: string | string[] | undefined): string => {
  if (Array.isArray(val)) return val[0] || '';
  return val || '';
};
