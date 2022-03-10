import React, { Component } from 'react';
import { GeoIndexPatternSelect } from '../../components/geo_index_pattern_select';
import { IndexPattern } from '../../../../../../src/plugins/data_views/common/data_views';

interface Props {
    value: string;
    onChange: (indexPattern: IndexPattern) => void;
};

interface State {};

export class DatashaderGeoIndexEditorField extends Component<Props, State> {
    render() {
        return (
          <GeoIndexPatternSelect
            value={this.props.value}
            onChange={this.props.onChange}
          />
        );
    };
}