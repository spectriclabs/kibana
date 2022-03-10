import { DATASHADER_STYLES } from '../../../../common/constants';
import { DatashaderStylePropertiesDescriptor } from '../../../../common/descriptor_types/style_property_descriptor_types';

export function getDefaultProperties(): DatashaderStylePropertiesDescriptor {
  return {
    [DATASHADER_STYLES.COLOR_RAMP_NAME]: "bmy",
    [DATASHADER_STYLES.COLOR_KEY_NAME]: "glasbey_light",
    [DATASHADER_STYLES.SPREAD]: "auto",
    [DATASHADER_STYLES.SPAN_RANGE]: "normal",
    [DATASHADER_STYLES.GRID_RESOLUTION]: "finest",
    [DATASHADER_STYLES.MODE]: "heat",
    [DATASHADER_STYLES.CATEGORY_FIELD]: "",
    [DATASHADER_STYLES.CATEGORY_FIELD_TYPE]: null,
    [DATASHADER_STYLES.CATEGORY_FIELD_PATTERN]: null,
    [DATASHADER_STYLES.SHOW_ELLIPSES]: false,
    [DATASHADER_STYLES.USE_HISTOGRAM]: undefined,
    [DATASHADER_STYLES.ELLIPSE_MAJOR_FIELD]: "",
    [DATASHADER_STYLES.ELLIPSE_MINOR_FIELD]: "",
    [DATASHADER_STYLES.ELLIPSE_TILT_FIELD]: "",
    [DATASHADER_STYLES.ELLIPSE_UNITS]: "semi_majmin_nm",
    [DATASHADER_STYLES.ELLIPSE_SEARCH_DISTANCE]: "normal",
    [DATASHADER_STYLES.ELLIPSE_THICKNESS]: 0,
    [DATASHADER_STYLES.MANUAL_RESOLUTION]: false,
  };
}