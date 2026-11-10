/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export interface DeviceLocationState {
  coordinates: [number, number] | null;
  accuracy: number | null; // in meters
  heading: number | null;
  speed: number | null;
  timestamp: number | null;
  isLocating: boolean;
  isLiveTracking: boolean;
  permissionStatus: 'prompt' | 'granted' | 'denied' | 'unsupported';
  errorMessage: string | null;
}

export function useDeviceLocation() {
  const [state, setState] = useState<DeviceLocationState>({
    coordinates: null,
    accuracy: null,
    heading: null,
    speed: null,
    timestamp: null,
    isLocating: false,
    isLiveTracking: false,
    permissionStatus: typeof navigator !== 'undefined' && 'geolocation' in navigator ? 'prompt' : 'unsupported',
    errorMessage: null,
  });

  const watchIdRef = useRef<number | null>(null);

  // Check initial permission status if supported
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'permissions' in navigator) {
      try {
        navigator.permissions.query({ name: 'geolocation' as PermissionName }).then((res) => {
          setState((prev) => ({
            ...prev,
            permissionStatus: res.state as 'prompt' | 'granted' | 'denied',
          }));

          res.onchange = () => {
            setState((prev) => ({
              ...prev,
              permissionStatus: res.state as 'prompt' | 'granted' | 'denied',
            }));
          };
        }).catch(() => {
          // Fallback if query not allowed
        });
      } catch (_) {}
    }
  }, []);

  // Request a single high-accuracy GPS fix
  const requestLocation = useCallback(async (): Promise<[number, number] | null> => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        permissionStatus: 'unsupported',
        errorMessage: 'Geolocation is not supported by your browser.',
        isLocating: false,
      }));
      return null;
    }

    setState((prev) => ({ ...prev, isLocating: true, errorMessage: null }));

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
          setState({
            coordinates: coords,
            accuracy: pos.coords.accuracy,
            heading: pos.coords.heading,
            speed: pos.coords.speed,
            timestamp: pos.timestamp,
            isLocating: false,
            isLiveTracking: false,
            permissionStatus: 'granted',
            errorMessage: null,
          });
          resolve(coords);
        },
        (err) => {
          let msg = 'Unable to retrieve location.';
          if (err.code === err.PERMISSION_DENIED) {
            msg = 'Location permission denied by user.';
          } else if (err.code === err.POSITION_UNAVAILABLE) {
            msg = 'GNSS position unavailable.';
          } else if (err.code === err.TIMEOUT) {
            msg = 'Location request timed out.';
          }

          setState((prev) => ({
            ...prev,
            isLocating: false,
            permissionStatus: err.code === err.PERMISSION_DENIED ? 'denied' : prev.permissionStatus,
            errorMessage: msg,
          }));
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 12000,
          maximumAge: 5000,
        }
      );
    });
  }, []);

  // Continuous watchPosition for live trip tracking
  const startLiveTracking = useCallback(() => {
    if (!navigator.geolocation) return;

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    setState((prev) => ({ ...prev, isLiveTracking: true, isLocating: true, errorMessage: null }));

    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setState((prev) => ({
          ...prev,
          coordinates: coords,
          accuracy: pos.coords.accuracy,
          heading: pos.coords.heading,
          speed: pos.coords.speed,
          timestamp: pos.timestamp,
          isLocating: false,
          isLiveTracking: true,
          permissionStatus: 'granted',
          errorMessage: null,
        }));
      },
      (err) => {
        setState((prev) => ({
          ...prev,
          isLocating: false,
          errorMessage: err.message || 'Tracking error',
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 1000,
      }
    );

    watchIdRef.current = id;
  }, []);

  const stopLiveTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setState((prev) => ({ ...prev, isLiveTracking: false, isLocating: false }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return {
    ...state,
    requestLocation,
    startLiveTracking,
    stopLiveTracking,
  };
}
