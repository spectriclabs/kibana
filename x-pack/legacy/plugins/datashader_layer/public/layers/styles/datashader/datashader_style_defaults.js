export function getDefaultProperties(mapColors = []) {
    return {
      colorRampName: "bmy",
      colorKeyName: "glasbey_light",
      spread: "auto",
      spanRange: "normal",
      gridResolution: "finest",
      mode: "heat",
      categoryField: "",
      categoryFieldType: null,
      categoryFieldPattern: null,
      numericMode: "categorical",
      ellipseMajorField: "",
      ellipseMinorField: "",
      ellipseTiltField: "",
      ellipseUnits: "semi_majmin_nm",
      ellipseSearchDistance: "normal",
      ellipseThickness: 0,
      trackField: "",
      trackThickness: 0,
      trackSearchDistance: "normal",
      manualResolution: false,
      renderMode: "points"
    };
  }