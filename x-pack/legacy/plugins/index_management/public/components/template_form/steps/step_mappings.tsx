/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React from 'react';
import { i18n } from '@kbn/i18n';
import { FormattedMessage } from '@kbn/i18n/react';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiTitle,
  EuiButtonEmpty,
  EuiSpacer,
  EuiFormRow,
  EuiText,
  EuiCodeEditor,
  EuiCode,
} from '@elastic/eui';
import { mappingDocumentationLink } from '../../../lib/documentation_links';
import { StepProps } from '../types';

export const StepMappings: React.FunctionComponent<StepProps> = ({
  template,
  updateTemplate,
  errors,
}) => {
  const { mappings } = template;
  const { mappings: mappingsError } = errors;

  return (
    <div data-test-subj="stepMappings">
      <EuiFlexGroup justifyContent="spaceBetween">
        <EuiFlexItem grow={false}>
          <EuiTitle>
            <h3 data-test-subj="stepTitle">
              <FormattedMessage
                id="xpack.idxMgmt.templateForm.stepMappings.stepTitle"
                defaultMessage="Mappings (optional)"
              />
            </h3>
          </EuiTitle>

          <EuiSpacer size="s" />

          <EuiText>
            <p>
              <FormattedMessage
                id="xpack.idxMgmt.templateForm.stepMappings.mappingsDescription"
                defaultMessage="Define how to store and index documents."
              />
            </p>
          </EuiText>
        </EuiFlexItem>

        <EuiFlexItem grow={false}>
          <EuiButtonEmpty
            size="s"
            flush="right"
            href={mappingDocumentationLink}
            target="_blank"
            iconType="help"
          >
            <FormattedMessage
              id="xpack.idxMgmt.templateForm.stepMappings.docsButtonLabel"
              defaultMessage="Mapping docs"
            />
          </EuiButtonEmpty>
        </EuiFlexItem>
      </EuiFlexGroup>

      <EuiSpacer size="l" />

      {/* Mappings code editor */}
      <EuiFormRow
        label={
          <FormattedMessage
            id="xpack.idxMgmt.templateForm.stepMappings.fieldMappingsLabel"
            defaultMessage="Mappings"
          />
        }
        helpText={
          <FormattedMessage
            id="xpack.idxMgmt.templateForm.stepMappings.mappingsEditorHelpText"
            defaultMessage="Use JSON format: {code}"
            values={{
              code: (
                <EuiCode>
                  {JSON.stringify({
                    properties: {
                      name: { type: 'text' },
                    },
                  })}
                </EuiCode>
              ),
            }}
          />
        }
        isInvalid={Boolean(mappingsError)}
        error={mappingsError}
        fullWidth
      >
        <EuiCodeEditor
          mode="json"
          theme="textmate"
          width="100%"
          height="500px"
          setOptions={{
            showLineNumbers: false,
            tabSize: 2,
          }}
          editorProps={{
            $blockScrolling: Infinity,
          }}
          showGutter={false}
          minLines={6}
          aria-label={i18n.translate(
            'xpack.idxMgmt.templateForm.stepMappings.fieldMappingsAriaLabel',
            {
              defaultMessage: 'Mappings editor',
            }
          )}
          value={mappings}
          onChange={(newMappings: string) => {
            updateTemplate({ mappings: newMappings });
          }}
          data-test-subj="mappingsEditor"
        />
      </EuiFormRow>
    </div>
  );
};
