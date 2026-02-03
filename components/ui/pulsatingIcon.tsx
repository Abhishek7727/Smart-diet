import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, StyleProp, View, ViewStyle } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

type PulsatingIconProps = {
  trigger: boolean;
  pulseDuration?: number;
  icons?: string[];
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;

  ringWidth?: number;
  ringPadding?: number;
  rotateDuration?: number;
  rotatorSize?: number;
};

export const PulsatingIcon: React.FC<PulsatingIconProps> = ({
  trigger,
  pulseDuration = 400,
  icons = ["bulb-outline", "bulb"],
  size = 20,
  color = "#000",
  style,

  ringWidth = 1,
  ringPadding = 3,
  rotateDuration = 900,
}) => {
  const safeIcons = useMemo(
    () => (icons.length ? icons : ["help-circle-outline"]),
    [icons]
  );
  const [index, setIndex] = useState(0);

  // 1) icon pulsation
  useEffect(() => {
    if (!trigger) {
      setIndex(0);
      return;
    }
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % safeIcons.length);
    }, pulseDuration);

    return () => clearInterval(id);
  }, [trigger, pulseDuration, safeIcons.length]);

  // 2) ring rotation (native driver friendly)
  const spin = useRef(new Animated.Value(0)).current;
  const loopRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (trigger) {
      spin.setValue(0);
      loopRef.current = Animated.loop(
        Animated.timing(spin, {
          toValue: 1,
          duration: rotateDuration,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      loopRef.current.start();
    } else {
      loopRef.current?.stop();
      spin.setValue(0);
    }

    return () => loopRef.current?.stop();
  }, [trigger, rotateDuration, spin]);

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  // sizing
  const innerPadding = Math.ceil(size / 4);
  const innerSize = size + innerPadding * 2;
  const outerSize = innerSize + (ringPadding + ringWidth) * 2;

  return (
    <View
      style={{
        width: outerSize,
        height: outerSize,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Animated.View
        pointerEvents="none"
        style={{
          position: "absolute",
          width: outerSize,
          height: outerSize,
          borderRadius: outerSize / 2,
          transform: [{ rotate }],
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <View
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            borderRadius: outerSize / 2,
            borderWidth: (trigger) ? 0 : ringWidth ,
            borderColor: color,
          }}
        />
        {trigger && (
          <View
            style={{
              position: "absolute",
              width: '100%',
              height: '100%',
              borderTopWidth: ringWidth*3,
              borderBottomWidth: ringWidth,
              borderLeftWidth: ringWidth*2,
              borderRadius: 100,
              borderColor: color,
            }}
          />
        )}
      </Animated.View>

      <View
        style={{
          width: innerSize,
          height: innerSize,
          borderRadius: innerSize / 2,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons
          name={safeIcons[index] as any}
          size={size}
          color={color}
          style={style as any}
        />
      </View>
    </View>
  );
};
