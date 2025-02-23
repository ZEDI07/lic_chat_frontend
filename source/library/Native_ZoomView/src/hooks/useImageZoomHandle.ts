import { Ref, useImperativeHandle } from 'react';
import { ImageZoomRef } from '../types';

export const useImageZoomHandle = (
  ref: Ref<unknown> | undefined,
  reset: () => void,
  scale: Number,
  savedScale: Number,
) => {
  useImperativeHandle(
    ref,
    (): ImageZoomRef => {
      console.log("inside ref", scale, "saved scale", savedScale)
      return {
        reset() {
          reset();
        },
        scale: scale,
        savedScale: savedScale
      }
    },
    [reset, scale, savedScale]
  );
};
