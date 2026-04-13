import stateData from '../state_helper.json';

const data = stateData;

export const getZones = () => data.zones || [];

export const getStates = (zoneName) => {
  if (zoneName) {
    const zone = data.zones.find(z => z.name === zoneName);
    return zone ? Object.values(zone.states) : [];
  }
  const states = new Map();
  (data.zones || []).forEach(zone => {
    Object.values(zone.states || {}).forEach(state => {
      if (!states.has(state.code)) {
        states.set(state.code, state);
      }
    });
  });
  return Array.from(states.values());
};

export const getRegions = (stateCode, zoneName) => {
  if (zoneName) {
    const zone = data.zones.find(z => z.name === zoneName);
    if (zone?.states[stateCode]) {
      return Object.values(zone.states[stateCode].regions || {});
    }
    return [];
  }
  const regions = new Map();
  (data.zones || []).forEach(zone => {
    if (zone.states?.[stateCode]) {
      Object.values(zone.states[stateCode].regions || {}).forEach(region => {
        if (!regions.has(region.code)) {
          regions.set(region.code, region);
        }
      });
    }
  });
  return Array.from(regions.values());
};

export const getBranches = (stateCode, regionCode, zoneName) => {
  if (zoneName) {
    const zone = data.zones.find(z => z.name === zoneName);
    if (zone?.states?.[stateCode]?.regions?.[regionCode]) {
      return Object.values(zone.states[stateCode].regions[regionCode].branches || {});
    }
    return [];
  }
  const branches = new Map();
  (data.zones || []).forEach(zone => {
    if (zone.states?.[stateCode]?.regions?.[regionCode]) {
      Object.values(zone.states[stateCode].regions[regionCode].branches || {}).forEach(branch => {
        if (!branches.has(branch.code)) {
          branches.set(branch.code, branch);
        }
      });
    }
  });
  return Array.from(branches.values());
};

export const getCenters = (centerCodes) => {
  return (centerCodes || []).map(code => data.centers?.[code]).filter(Boolean);
};

export const getCenter = (centerCode) => {
  return data.centers?.[centerCode];
};

export const getUnits = (unitCodes) => {
  return (unitCodes || []).map(code => data.units?.[code]).filter(Boolean);
};

export const getUnit = (unitCode) => {
  return data.units?.[unitCode];
};

export const getAllCenters = () => {
  return Object.values(data.centers || {});
};

export const getAllUnits = () => {
  return Object.values(data.units || {});
};

export const findHierarchy = (unitCode, centerCode, branchCode) => {
  if (unitCode) {
    const unit = data.units?.[unitCode];
    if (unit) {
      const center = Object.values(data.centers || {}).find(c => c.units?.includes(unitCode));
      if (center) {
        centerCode = center.code;
        for (const zone of data.zones || []) {
          for (const state of Object.values(zone.states || {})) {
            for (const region of Object.values(state.regions || {})) {
              const branch = Object.values(region.branches || {}).find(b => b.centers?.includes(centerCode));
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