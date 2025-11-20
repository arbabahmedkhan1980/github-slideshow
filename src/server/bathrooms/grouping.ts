import { BathroomInstance } from "@prisma/client";

type Group = {
  key: string;
  instances: BathroomInstance[];
  centroid: { lengthMm: number; widthMm: number; heightMm: number };
};

const withinTolerance = (a: number, b: number, tolerance: number) => {
  return Math.abs(a - b) <= tolerance;
};

const makeGroupKey = (length: number, width: number, height: number) =>
  `${length}-${width}-${height}`;

export const groupBathroomsBySize = (
  instances: BathroomInstance[],
  toleranceMm: number
): Group[] => {
  const groups: Group[] = [];

  for (const instance of instances) {
    let match = groups.find(({ centroid }) => {
      return (
        withinTolerance(centroid.lengthMm, instance.lengthMm, toleranceMm) &&
        withinTolerance(centroid.widthMm, instance.widthMm, toleranceMm)
      );
    });

    if (!match) {
      match = {
        key: makeGroupKey(instance.lengthMm, instance.widthMm, instance.heightMm),
        centroid: {
          lengthMm: instance.lengthMm,
          widthMm: instance.widthMm,
          heightMm: instance.heightMm
        },
        instances: []
      };
      groups.push(match);
    }

    match.instances.push(instance);
    const total = match.instances.length;
    match.centroid = {
      lengthMm:
        (match.centroid.lengthMm * (total - 1) + instance.lengthMm) / total,
      widthMm:
        (match.centroid.widthMm * (total - 1) + instance.widthMm) / total,
      heightMm:
        (match.centroid.heightMm * (total - 1) + instance.heightMm) / total
    };
  }

  return groups;
};
