/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import _ from 'lodash';
import React from 'react';
import { ResizeChecker } from '../../../../../../../src/plugins/kibana_utils/public';
import { removeOrphanedSourcesAndLayers, addSpritesheetToMap } from './utils';
import { syncLayerOrder } from './sort_layers';
import { getGlyphUrl, isRetina } from '../../../meta';
import {
  DECIMAL_DEGREES_PRECISION,
  KBN_TOO_MANY_FEATURES_IMAGE_ID,
  ZOOM_PRECISION,
} from '../../../../common/constants';
import mapboxgl from 'mapbox-gl/dist/mapbox-gl-csp';
import mbWorkerUrl from '!!file-loader!mapbox-gl/dist/mapbox-gl-csp-worker';
import mbRtlPlugin from '!!file-loader!@mapbox/mapbox-gl-rtl-text/mapbox-gl-rtl-text.min.js';
import { spritesheet } from '@elastic/maki';
import sprites1 from '@elastic/maki/dist/sprite@1.png';
import sprites2 from '@elastic/maki/dist/sprite@2.png';
import { DrawControl } from './draw_control';
import { TooltipControl } from './tooltip_control';
import { clampToLatBounds, clampToLonBounds } from '../../../../common/elasticsearch_util';
import { getInitialView } from './get_initial_view';
import { getPreserveDrawingBuffer } from '../../../kibana_services';

mapboxgl.workerUrl = mbWorkerUrl;
mapboxgl.setRTLTextPlugin(mbRtlPlugin);

export class MBMap extends React.Component {
  state = {
    prevLayerList: undefined,
    hasSyncedLayerList: false,
    mbMap: undefined,
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    const nextLayerList = nextProps.layerList;
    if (nextLayerList !== prevState.prevLayerList) {
      return {
        prevLayerList: nextLayerList,
        hasSyncedLayerList: false,
      };
    }

    return null;
  }

  componentDidMount() {
    this._initializeMap();
    this._isMounted = true;
  }

  componentDidUpdate() {
    if (this.state.mbMap) {
      // do not debounce syncing of map-state
      this._syncMbMapWithMapState();
      this._debouncedSync();
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
    if (this._checker) {
      this._checker.destroy();
    }
    if (this.state.mbMap) {
      this.state.mbMap.remove();
      this.state.mbMap = null;
    }
    if (this.cacheCheck) {
      clearInterval(this.cacheCheck);
      this.cacheCheck = null;
    }
    this.props.onMapDestroyed();
  }

  _debouncedSync = _.debounce(() => {
    if (this._isMounted && this.props.isMapReady) {
      if (!this.state.hasSyncedLayerList) {
        this.setState(
          {
            hasSyncedLayerList: true,
          },
          () => {
            this._syncMbMapWithLayerList();
            this._syncMbMapWithInspector();
          }
        );
      }
      this.props.spatialFiltersLayer.syncLayerWithMB(this.state.mbMap);
      this._syncSettings();
    }
  }, 256);

  _getMapState() {
    const zoom = this.state.mbMap.getZoom();
    const mbCenter = this.state.mbMap.getCenter();
    const mbBounds = this.state.mbMap.getBounds();
    return {
      zoom: _.round(zoom, ZOOM_PRECISION),
      center: {
        lon: _.round(mbCenter.lng, DECIMAL_DEGREES_PRECISION),
        lat: _.round(mbCenter.lat, DECIMAL_DEGREES_PRECISION),
      },
      extent: {
        minLon: _.round(mbBounds.getWest(), DECIMAL_DEGREES_PRECISION),
        minLat: _.round(mbBounds.getSouth(), DECIMAL_DEGREES_PRECISION),
        maxLon: _.round(mbBounds.getEast(), DECIMAL_DEGREES_PRECISION),
        maxLat: _.round(mbBounds.getNorth(), DECIMAL_DEGREES_PRECISION),
      },
    };
  }

  async _createMbMapInstance() {
    const initialView = await getInitialView(this.props.goto, this.props.settings);
    return new Promise((resolve) => {
      const mbStyle = {
        version: 8,
        sources: {},
        layers: [],
        glyphs: getGlyphUrl(),
      };

      const options = {
        attributionControl: false,
        container: this.refs.mapContainer,
        style: mbStyle,
        scrollZoom: this.props.scrollZoom,
        preserveDrawingBuffer: getPreserveDrawingBuffer(),
        interactive: !this.props.disableInteractive,
        maxZoom: this.props.settings.maxZoom,
        minZoom: this.props.settings.minZoom,
      };
      if (initialView) {
        options.zoom = initialView.zoom;
        options.center = {
          lng: initialView.lon,
          lat: initialView.lat,
        };
      } else {
        options.bounds = [-170, -60, 170, 75];
      }
      const mbMap = new mapboxgl.Map(options);
      mbMap.dragRotate.disable();
      mbMap.touchZoomRotate.disableRotation();
      if (!this.props.disableInteractive) {
        mbMap.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-left');
      }

      const tooManyFeaturesImageSrc =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAA7DgAAOw4BzLahgwAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAARLSURBVHic7ZnPbxRVAMe/7735sWO3293ZlUItJsivCxEE0oTYRgu1FqTQoFSwKTYx8SAH/wHjj4vRozGGi56sMcW2UfqTEuOhppE0KJc2GIuKQFDY7qzdtrudX88D3YTUdFuQN8+k87ltZt7uZz958/bNLAGwBWsYKltANmEA2QKyCQPIFpBNGEC2gGzCALIFZBMGkC0gmzCAbAHZhAFkC8gmDCBbQDZhANkCslnzARQZH6oDpNs0D5UDSUIInePcOpPLfdfnODNBuwQWIAWwNOABwHZN0x8npE6hNLJ4DPWRyFSf40wE5VOEQPBjcR0g3YlE4ybGmtK+/1NzJtOZA/xSYwZMs3nG962T2ez3It2AANaA/kSidYuivOQBs5WM1fUnk6f0u+GXJUqIuUtVXx00zRbRfkIDfBqL7a1WlIYbjvNtTTr99jXXHVpH6dMjK0R4cXq6c9rzxjcx9sKX8XitSEdhAToMI7VP10/97fsTh7PZrgWAN1lW72KE2vOm2b5chDTgtWQyn93x/bEEIetEOQIC14CxVOr1CkKefH929t0v8vn0vcdGEoljGxXl4C3PGz2YyXy+AHARDqtByAxoUdWKBKV70r4/vvTLA0CjZfX+5nkDGxirKzUTgkBIgNaysh3gnF627R+XO+dQJvP1ddcdrmSsbtA020pF+CAW21qrqmUiXIUEqGRsIwD0FQq/lzqv0bJ6rrvucBVjzwyb5ivLRTiiaW+8VV7eIEBVTAANiIIQd9RxZlc6t9Gyem647vn1jD07ZJonl4sQASoevqmgABzwwHnJzc69PGdZ3X+47sgGxuqHTPPE0ggeVtg5/QeEBMhxPg1Aa1DV2GrHPG9ZXy1G2D+wNALn9jyQEeHKAJgP+033Kgrdqij7AFwZtu3bqx3XWShMHtV1o1pRGo4YxiNd+fyEB2DKdX/4aG5u0hbwcylkBryTy/3scT6zW9Nq7ndso2Wdvea6Q1WUHuiPx1/WAXLBcWZXun94UMRcAoD/p+ddTFK6u8MwUvc7vsmyem+67oVqVT0wkEgcF+FYRNhW+L25uX6f84XThtHxIBudE5bVY/t++jFVrU/dvVSFICzAqG3PX/S8rihj2/61qK1AOUB7ksl2jdLUL7Z9rvgcQQRCFsEi5wqFmw26XnhCUQ63GcZmCly95Lrzpca0G0byk3j8tEnpU1c975tmyxoU5QcE8EAEAM5WVOzfoarHAeC2749dcpzxMwsLv07Ztg0AOzVNf03Ttu/S9T2PMlbjc25fdpyutmx2TLRbIAEA4M1otKo1EjmaoHQn4ZwBgA/kAVAK6MXXdzxv/ONcrq/HcbJBeAUWoEizqsaORaPbKglZrxMSZZyrM76f/ovzWx/m85PFWREUgQf4v7Hm/xcIA8gWkE0YQLaAbMIAsgVkEwaQLSCbMIBsAdmEAWQLyCYMIFtANmEA2QKyCQPIFpDNmg/wD3OFdEybUvJjAAAAAElFTkSuQmCC';
      const tooManyFeaturesImage = new Image();
      tooManyFeaturesImage.onload = () => {
        mbMap.addImage(KBN_TOO_MANY_FEATURES_IMAGE_ID, tooManyFeaturesImage);
      };
      tooManyFeaturesImage.src = tooManyFeaturesImageSrc;

      let emptyImage;
      mbMap.on('styleimagemissing', (e) => {
        if (emptyImage) {
          mbMap.addImage(e.id, emptyImage);
        }
      });
      mbMap.on('load', () => {
        emptyImage = new Image();

        emptyImage.src =
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQYV2NgAAIAAAUAAarVyFEAAAAASUVORK5CYII=';
        emptyImage.crossOrigin = 'anonymous';
        resolve(mbMap);
      });

      // mapbox-gl has bugs #10031 and #10494 that ignore the cache control
      // headers provided by Datashader; these exist up to at least v2.2.0
      // for now, datashader will return an 'error' code of 418 TEAPOT
      mbMap.on('error', (e) => {
        if (e.tile && e.error && e.error.status === 302 && e.source.type === "raster") {
          if (e.tile.state === 'errored' && e.tile.expirationTime === null) {
            // Try any errored tiles again in 5 seconds by setting expiration time
            e.tile.expirationTime = Date.now() + 5000;
          }
        }
      });

      if (!this.cacheCheck) {
        this.cacheCheck = setInterval(() => {
          if (mbMap.style && mbMap.style.sourceCaches) {
            for (const sourceId in mbMap.style.sourceCaches) {
              const sourceCache = mbMap.style.sourceCaches[sourceId];
              if (sourceCache && sourceCache._tiles) {
                for (const id in sourceCache._tiles) {
                  const tile = sourceCache._tiles[id];
                  if (tile && tile.state === 'errored' && tile.expirationTime !== null && tile.expirationTime < Date.now()) {
                    sourceCache._tiles[id].state = "expired";
                    sourceCache._tiles[id].expirationTime = null;
                    sourceCache._reloadTile(id, 'reloading');
                  }
                }
              }
            }
          }
        }, 1000);
      }
    });
  }

  async _initializeMap() {
    let mbMap;
    try {
      mbMap = await this._createMbMapInstance();
    } catch (error) {
      this.props.setMapInitError(error.message);
      return;
    }

    if (!this._isMounted) {
      return;
    }

    this.setState({ mbMap }, () => {
      this._loadMakiSprites();
      this._initResizerChecker();
      this._registerMapEventListeners();
      this.props.onMapReady(this._getMapState());
    });
  }

  _registerMapEventListeners() {
    // moveend callback is debounced to avoid updating map extent state while map extent is still changing
    // moveend is fired while the map extent is still changing in the following scenarios
    // 1) During opening/closing of layer details panel, the EUI animation results in 8 moveend events
    // 2) Setting map zoom and center from goto is done in 2 API calls, resulting in 2 moveend events
    this.state.mbMap.on(
      'moveend',
      _.debounce(() => {
        this.props.extentChanged(this._getMapState());
      }, 100)
    );
    // Attach event only if view control is visible, which shows lat/lon
    if (!this.props.hideViewControl) {
      const throttledSetMouseCoordinates = _.throttle((e) => {
        this.props.setMouseCoordinates({
          lat: e.lngLat.lat,
          lon: e.lngLat.lng,
        });
      }, 100);
      this.state.mbMap.on('mousemove', throttledSetMouseCoordinates);
      this.state.mbMap.on('mouseout', () => {
        throttledSetMouseCoordinates.cancel(); // cancel any delayed setMouseCoordinates invocations
        this.props.clearMouseCoordinates();
      });
    }
  }

  _initResizerChecker() {
    this._checker = new ResizeChecker(this.refs.mapContainer);
    this._checker.on('resize', () => {
      this.state.mbMap.resize();
    });
  }

  _loadMakiSprites() {
    const sprites = isRetina() ? sprites2 : sprites1;
    const json = isRetina() ? spritesheet[2] : spritesheet[1];
    addSpritesheetToMap(json, sprites, this.state.mbMap);
  }

  _syncMbMapWithMapState = () => {
    const { isMapReady, goto, clearGoto } = this.props;

    if (!isMapReady || !goto) {
      return;
    }

    clearGoto();

    if (goto.bounds) {
      //clamping ot -89/89 latitudes since Mapboxgl does not seem to handle bounds that contain the poles (logs errors to the console when using -90/90)
      const lnLatBounds = new mapboxgl.LngLatBounds(
        new mapboxgl.LngLat(
          clampToLonBounds(goto.bounds.minLon),
          clampToLatBounds(goto.bounds.minLat)
        ),
        new mapboxgl.LngLat(
          clampToLonBounds(goto.bounds.maxLon),
          clampToLatBounds(goto.bounds.maxLat)
        )
      );
      //maxZoom ensure we're not zooming in too far on single points or small shapes
      //the padding is to avoid too tight of a fit around edges
      this.state.mbMap.fitBounds(lnLatBounds, { maxZoom: 17, padding: 16 });
    } else if (goto.center) {
      this.state.mbMap.setZoom(goto.center.zoom);
      this.state.mbMap.setCenter({
        lng: goto.center.lon,
        lat: goto.center.lat,
      });
    }
  };

  _syncMbMapWithLayerList = () => {
    removeOrphanedSourcesAndLayers(
      this.state.mbMap,
      this.props.layerList,
      this.props.spatialFiltersLayer
    );
    this.props.layerList.forEach((layer) => layer.syncLayerWithMB(this.state.mbMap));
    syncLayerOrder(this.state.mbMap, this.props.spatialFiltersLayer, this.props.layerList);
  };

  _syncMbMapWithInspector = () => {
    if (!this.props.inspectorAdapters.map) {
      return;
    }

    const stats = {
      center: this.state.mbMap.getCenter().toArray(),
      zoom: this.state.mbMap.getZoom(),
    };
    this.props.inspectorAdapters.map.setMapState({
      stats,
      style: this.state.mbMap.getStyle(),
    });
  };

  _syncSettings() {
    let zoomRangeChanged = false;
    if (this.props.settings.minZoom !== this.state.mbMap.getMinZoom()) {
      this.state.mbMap.setMinZoom(this.props.settings.minZoom);
      zoomRangeChanged = true;
    }
    if (this.props.settings.maxZoom !== this.state.mbMap.getMaxZoom()) {
      this.state.mbMap.setMaxZoom(this.props.settings.maxZoom);
      zoomRangeChanged = true;
    }

    // 'moveend' event not fired when map moves from setMinZoom or setMaxZoom
    // https://github.com/mapbox/mapbox-gl-js/issues/9610
    // hack to update extent after zoom update finishes moving map.
    if (zoomRangeChanged) {
      setTimeout(() => {
        this.props.extentChanged(this._getMapState());
      }, 300);
    }
  }

  render() {
    let drawControl;
    let tooltipControl;
    if (this.state.mbMap) {
      drawControl = <DrawControl mbMap={this.state.mbMap} addFilters={this.props.addFilters} />;
      tooltipControl = !this.props.disableTooltipControl ? (
        <TooltipControl
          mbMap={this.state.mbMap}
          addFilters={this.props.addFilters}
          getFilterActions={this.props.getFilterActions}
          getActionContext={this.props.getActionContext}
          geoFields={this.props.geoFields}
          renderTooltipContent={this.props.renderTooltipContent}
        />
      ) : null;
    }
    return (
      <div
        id="mapContainer"
        className="mapContainer"
        ref="mapContainer"
        data-test-subj="mapContainer"
      >
        {drawControl}
        {tooltipControl}
      </div>
    );
  }
}
