/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { mount } from 'enzyme';
import React from 'react';
import { mountHook } from '../../../../../../../../../test_utils/enzyme_helpers';

import { CreateAnalyticsForm } from './create_analytics_form';

import { KibanaContext } from '../../../../../contexts/kibana';
import { kibanaContextValueMock } from '../../../../../contexts/kibana/__mocks__/kibana_context_value';

import { useCreateAnalyticsForm } from '../../hooks/use_create_analytics_form';

jest.mock('ui/index_patterns', () => ({
  validateIndexPattern: () => true,
  INDEX_PATTERN_ILLEGAL_CHARACTERS: [],
}));

const getMountedHook = () =>
  mountHook(
    () => useCreateAnalyticsForm(),
    ({ children }) => (
      <KibanaContext.Provider value={kibanaContextValueMock}>{children}</KibanaContext.Provider>
    )
  );

// workaround to make React.memo() work with enzyme
jest.mock('react', () => {
  const r = jest.requireActual('react');
  return { ...r, memo: (x: any) => x };
});

describe('Data Frame Analytics: <CreateAnalyticsForm />', () => {
  test('Minimal initialization', () => {
    const { getLastHookValue } = getMountedHook();
    const props = getLastHookValue();
    const wrapper = mount(<CreateAnalyticsForm {...props} />);

    const euiFormRows = wrapper.find('EuiFormRow');
    expect(euiFormRows.length).toBe(5);

    const row1 = euiFormRows.at(0);
    expect(row1.find('label').text()).toBe('Job type');
    expect(row1.find('EuiText').text()).toBe('Outlier detection');
    expect(row1.find('EuiLink').text()).toBe('advanced editor');

    const row2 = euiFormRows.at(1);
    expect(row2.find('label').text()).toBe('Job ID');
  });
});
