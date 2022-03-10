import { i18n } from '@kbn/i18n';
import React, { Component } from 'react';
import { EuiFormRow } from '@elastic/eui';
import { SingleFieldSelect } from '../../components/single_field_select';
import { DataViewField } from '../../../../../../src/plugins/data_views/common/fields/data_view_field';

interface Props {
    indexPatternDefined: boolean;
    value: string;
    onChange: (fieldName: string | undefined) => void;
    fields: DataViewField[];
};

interface State {};

export class DatashaderGeoFieldEditorField extends Component<Props, State> {
    render() {
        if (!this.props.indexPatternDefined) {
            return null;
          }
      
          return (
            <EuiFormRow
              label={i18n.translate('xpack.maps.source.esSearch.geofieldLabel', {
                defaultMessage: 'Geospatial field',
              })}
            >
              <SingleFieldSelect
                placeholder={i18n.translate('xpack.maps.source.esSearch.selectLabel', {
                  defaultMessage: 'Select geo field',
                })}
                value={this.props.value}
                onChange={this.props.onChange}
                fields={this.props.fields}
              />
            </EuiFormRow>
          );
    };
}