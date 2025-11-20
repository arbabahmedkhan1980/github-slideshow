import { BathroomInstance, BathroomType } from "@prisma/client";

export const MM_PER_FOOT = 304.8;

export const toFeet = (mm: number): number => {
  return mm / MM_PER_FOOT;
};

export const fromFeet = (feet: number): number => {
  return feet * MM_PER_FOOT;
};

export const roundTo = (value: number, decimals = 2): number => {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
};

export const deriveGeometry = (lengthMm: number, widthMm: number, heightMm: number) => {
  const lengthFt = toFeet(lengthMm);
  const widthFt = toFeet(widthMm);
  const heightFt = toFeet(heightMm);
  const floorArea = lengthFt * widthFt;
  const wallArea = 2 * heightFt * (lengthFt + widthFt);
  const ceilingArea = floorArea;

  return {
    lengthFt: roundTo(lengthFt),
    widthFt: roundTo(widthFt),
    heightFt: roundTo(heightFt),
    floorArea: roundTo(floorArea),
    wallArea: roundTo(wallArea),
    ceilingArea: roundTo(ceilingArea)
  };
};

export const computeBathroomTypeFromInstance = (
  instance: BathroomInstance,
  toleranceMm = 50
): Pick<BathroomType, "lengthMm" | "widthMm" | "heightMm" | "toleranceMm" | "floorAreaSqft" | "wallAreaSqft" | "ceilingAreaSqft"> => {
  const geometry = deriveGeometry(instance.lengthMm, instance.widthMm, instance.heightMm);
  return {
    lengthMm: instance.lengthMm,
    widthMm: instance.widthMm,
    heightMm: instance.heightMm,
    toleranceMm,
    floorAreaSqft: geometry.floorArea,
    wallAreaSqft: geometry.wallArea,
    ceilingAreaSqft: geometry.ceilingArea
  };
};
