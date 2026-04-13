import stateData from '../state_helper.json';

export interface Zone {
  name: string;
  states: Record<string, State>;
}

export interface State {
  code: string;
  name: string;
  regions: Record<string, Region>;
}

export interface Region {
  code: string;
  name: string;
  branches: Record<string, Branch>;
}

export interface Branch {
  code: string;
  name: string;
  centers: string[];
}

export interface Center {
  code: string;
  name: string;
  units: string[];
}

export interface Unit {
  code: string;
  name: string;
}

interface StateData {
  zones: Zone[];
  centers: Record<string, Center>;
  units: Record<string, Unit>;
}

const data = stateData as StateData;

export const getZones = (): Zone[] => data.zones;

export const getStates = (zoneName?: string): State[] => {
  if (zoneName) {
    const zone = data.zones.find(z => z.name === zoneName);
    return zone ? Object.values(zone.states) : [];
  }
  const states = new Map<string, State>();
  data.zones.forEach(zone => {
    Object.values(zone.states).forEach(state => {
      if (!states.has(state.code)) {
        states.set(state.code, state);
      }
    });
  });
  return Array.from(states.values());
};

export const getRegions = (stateCode: string, zoneName?: string): Region[] => {
  if (zoneName) {
    const zone = data.zones.find(z => z.name === zoneName);
    if (zone?.states[stateCode]) {
      return Object.values(zone.states[stateCode].regions);
    }
    return [];
  }
  const regions = new Map<string, Region>();
  data.zones.forEach(zone => {
    if (zone.states[stateCode]) {
      Object.values(zone.states[stateCode].regions).forEach(region => {
        if (!regions.has(region.code)) {
          regions.set(region.code, region);
        }
      });
    }
  });
  return Array.from(regions.values());
};

export const getBranches = (stateCode: string, regionCode: string, zoneName?: string): Branch[] => {
  if (zoneName) {
    const zone = data.zones.find(z => z.name === zoneName);
    if (zone?.states[stateCode]?.regions[regionCode]) {
      return Object.values(zone.states[stateCode].regions[regionCode].branches);
    }
    return [];
  }
  const branches = new Map<string, Branch>();
  data.zones.forEach(zone => {
    if (zone.states[stateCode]?.regions[regionCode]) {
      Object.values(zone.states[stateCode].regions[regionCode].branches).forEach(branch => {
        if (!branches.has(branch.code)) {
          branches.set(branch.code, branch);
        }
      });
    }
  });
  return Array.from(branches.values());
};

export const getCenters = (centerCodes: string[]): Center[] => {
  return centerCodes.map(code => data.centers[code]).filter(Boolean);
};

export const getCenter = (centerCode: string): Center | undefined => {
  return data.centers[centerCode];
};

export const getUnits = (unitCodes: string[]): Unit[] => {
  return unitCodes.map(code => data.units[code]).filter(Boolean);
};

export const getUnit = (unitCode: string): Unit | undefined => {
  return data.units[unitCode];
};

export const getAllCenters = (): Center[] => {
  return Object.values(data.centers);
};

export const getAllUnits = (): Unit[] => {
  return Object.values(data.units);
};

export const findHierarchy = (unitCode?: string, centerCode?: string, branchCode?: string) => {
  if (unitCode) {
    const unit = data.units[unitCode];
    if (unit) {
      const center = Object.values(data.centers).find(c => c.units.includes(unitCode));
      if (center) {
        centerCode = center.code;
        for (const zone of data.zones) {
          for (const state of Object.values(zone.states)) {
            for (const region of Object.values(state.regions)) {
              const branch = Object.values(region.branches).find(b => b.centers.includes(centerCode));
              if (branch) {
                return { zone: zone.name, state: state.code, region: region.code, branch: branch.code, center: centerCode, unit: unitCode };
              }
            }
          }
        }
      }
    }
  }
  return null;
};

export default {
  getZones,
  getStates,
  getRegions,
  getBranches,
  getCenters,
  getCenter,
  getUnits,
  getUnit,
  getAllCenters,
  getAllUnits,
  findHierarchy
};