// Bed identifiers available in the dormitory (1..40).
export const BedTypes: string[] = Array.from({ length: 40 }, (_, i) =>
  String(i + 1)
);
