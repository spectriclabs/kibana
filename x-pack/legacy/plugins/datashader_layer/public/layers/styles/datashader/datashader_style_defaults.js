export function getDefaultProperties(mapColors = []) {
    return {
      colorRampName: "bmy",
      colorKeyName: "glasbey_light",
      spread: "auto",
      spanRange: "auto",
      mode: "heat",
      categoryField: "",
      categoryFieldType: null,
      showEllipses: false,
      ellipseMajorField: "",
      ellipseMinorField: "",
      ellipseTiltField: "",
      ellipseUnits: "semi_majmin_nm",
      manualResolution: false,
    };
  }