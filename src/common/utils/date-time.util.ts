export const now = (): Date => {
  return new Date();
};

export const addMinutes = (
  minutesToAdd: number,
  baseDate: Date = now(),
): Date => {
  const futureDate = new Date(baseDate);
  futureDate.setMinutes(futureDate.getMinutes() + minutesToAdd);

  return futureDate;
};
