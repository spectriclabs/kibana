export function getDefaultProperties(mapColors = []) {
    return {
      colorRampName: "bmy",
      colorKeyName: "glasbey_light",
      spread: "auto",
      spanRange: "auto",
      mode: "heat",
      categoryField: null,
      showEllipses: false,
      ellipseMajorField: null,
      ellipseMinorField: null,
      ellipseTiltField: null,
      ellipseUnits: "semi_majmin_nm",
      manualResolution: false,
    };
  }