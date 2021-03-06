/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { newPlatformHttp } from './base_path.test.mocks';
import { initChromeBasePathApi } from './base_path';

function initChrome() {
  const chrome: any = {};
  initChromeBasePathApi(chrome);
  return chrome;
}

newPlatformHttp.basePath.get.mockImplementation(() => 'gotBasePath');
newPlatformHttp.basePath.prepend.mockImplementation(() => 'addedToPath');
newPlatformHttp.basePath.remove.mockImplementation(() => 'removedFromPath');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('#getBasePath()', () => {
  it('proxies to newPlatformHttp.basePath.get()', () => {
    const chrome = initChrome();
    expect(newPlatformHttp.basePath.prepend).not.toHaveBeenCalled();
    expect(chrome.getBasePath()).toBe('gotBasePath');
    expect(newPlatformHttp.basePath.get).toHaveBeenCalledTimes(1);
    expect(newPlatformHttp.basePath.get).toHaveBeenCalledWith();
  });
});

describe('#addBasePath()', () => {
  it('proxies to newPlatformHttp.basePath.prepend(path)', () => {
    const chrome = initChrome();
    expect(newPlatformHttp.basePath.prepend).not.toHaveBeenCalled();
    expect(chrome.addBasePath('foo/bar')).toBe('addedToPath');
    expect(newPlatformHttp.basePath.prepend).toHaveBeenCalledTimes(1);
    expect(newPlatformHttp.basePath.prepend).toHaveBeenCalledWith('foo/bar');
  });
});

describe('#removeBasePath', () => {
  it('proxies to newPlatformBasePath.basePath.remove(path)', () => {
    const chrome = initChrome();
    expect(newPlatformHttp.basePath.remove).not.toHaveBeenCalled();
    expect(chrome.removeBasePath('foo/bar')).toBe('removedFromPath');
    expect(newPlatformHttp.basePath.remove).toHaveBeenCalledTimes(1);
    expect(newPlatformHttp.basePath.remove).toHaveBeenCalledWith('foo/bar');
  });
});
