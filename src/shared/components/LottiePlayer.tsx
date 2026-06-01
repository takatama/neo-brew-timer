import lottie, { type AnimationItem } from "lottie-web";
import { useEffect, useRef, useCallback } from "react";
import styles from "./LottiePlayer.module.css";

interface Props {
  animationKeys: string[];
  onComplete?: () => void;
}

const lottieAssetPaths: Record<string, string> = {
  switch_open: "/assets/lottie/switch_open.json",
  switch_close: "/assets/lottie/switch_close.json",
  pour: "/assets/lottie/pour.json",
  cool: "/assets/lottie/cool.json",
};

export function buildLottieQueue(actionType: string): string[] {
  if (actionType === "bloom") return ["pour"];
  if (actionType === "switch_close_pour") return ["switch_close", "pour"];
  if (actionType === "switch_open_pour") return ["switch_open", "pour"];
  if (actionType === "pour_cool") return ["pour", "cool"];
  if (actionType === "switch_close") return ["switch_close"];
  if (actionType === "switch_open") return ["switch_open"];
  if (actionType === "pour") return ["pour"];
  return [];
}

export function LottiePlayer({ animationKeys, onComplete }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<AnimationItem | null>(null);
  const queueRef = useRef<string[]>([]);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const destroyInstance = useCallback(() => {
    if (instanceRef.current) {
      instanceRef.current.destroy();
      instanceRef.current = null;
    }
  }, []);

  const playNext = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    destroyInstance();

    const nextKey = queueRef.current.shift();
    if (!nextKey) {
      onCompleteRef.current?.();
      return;
    }

    const path = lottieAssetPaths[nextKey];
    if (!path) {
      onCompleteRef.current?.();
      return;
    }

    instanceRef.current = lottie.loadAnimation({
      container,
      renderer: "svg",
      loop: false,
      autoplay: true,
      path,
    });

    instanceRef.current.addEventListener("complete", () => {
      if (queueRef.current.length > 0) {
        playNext();
      } else {
        onCompleteRef.current?.();
      }
    });
  }, [destroyInstance]);

  useEffect(() => {
    queueRef.current = [...animationKeys];
    playNext();

    return () => {
      destroyInstance();
      queueRef.current = [];
    };
  }, [animationKeys, playNext, destroyInstance]);

  return <div className={styles.lottie} ref={containerRef} />;
}
