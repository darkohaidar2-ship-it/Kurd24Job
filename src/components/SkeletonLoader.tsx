import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet, Dimensions, Easing } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useApp } from "../context/AppContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface SkeletonCardProps {
  index?: number;
}

const SkeletonCard: React.FC<SkeletonCardProps> = ({ index = 0 }) => {
  const { theme } = useApp();
  const isDark = theme === "dark";
  const shimmerAnim = useRef(new Animated.Value(-1)).current;

  const baseBg = isDark ? "rgba(28, 36, 52, 0.98)" : "rgba(228, 233, 244, 0.98)";
  const lineBg = isDark ? "rgba(50, 62, 85, 0.9)" : "rgba(200, 210, 228, 0.9)";
  const shimmerColors = isDark
    ? ["rgba(255,255,255,0)", "rgba(255,255,255,0.07)", "rgba(255,255,255,0)"]
    : ["rgba(255,255,255,0)", "rgba(255,255,255,0.6)", "rgba(255,255,255,0)"];

  useEffect(() => {
    const delay = index * 110;
    const timeout = setTimeout(() => {
      Animated.loop(
        Animated.timing(shimmerAnim, {
          toValue: 2,
          duration: 1350,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    }, delay);
    return () => clearTimeout(timeout);
  }, []);

  const translateX = shimmerAnim.interpolate({
    inputRange: [-1, 2],
    outputRange: [-SCREEN_WIDTH, SCREEN_WIDTH * 2],
  });

  return (
    <View style={[styles.card, { backgroundColor: baseBg }]}>
      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          { transform: [{ translateX }], zIndex: 2, pointerEvents: "none" },
        ]}
      >
        <LinearGradient
          colors={shimmerColors as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFillObject}
        />
      </Animated.View>

      <View style={[styles.lineTall, { backgroundColor: lineBg, width: "72%" }]} />
      <View style={[styles.lineShort, { backgroundColor: lineBg, width: "48%", marginTop: 8 }]} />

      <View style={styles.metaRow}>
        <View style={[styles.avatar, { backgroundColor: lineBg }]} />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <View style={[styles.lineThin, { backgroundColor: lineBg, width: "55%" }]} />
          <View style={[styles.lineThin, { backgroundColor: lineBg, width: "38%", marginTop: 6 }]} />
        </View>
      </View>

      <View style={[styles.lineDesc, { backgroundColor: lineBg, width: "100%" }]} />
      <View style={[styles.lineDesc, { backgroundColor: lineBg, width: "90%", marginTop: 6 }]} />
      <View style={[styles.lineDesc, { backgroundColor: lineBg, width: "70%", marginTop: 6 }]} />

      <View style={[styles.imagePlaceholder, { backgroundColor: lineBg }]} />

      <View style={styles.footerRow}>
        <View style={[styles.lineThin, { backgroundColor: lineBg, width: 80 }]} />
        <View style={[styles.lineThin, { backgroundColor: lineBg, width: 64 }]} />
      </View>

      <View style={[styles.btnPlaceholder, { backgroundColor: lineBg }]} />

      <View
        style={[
          styles.divider,
          {
            backgroundColor: isDark
              ? "rgba(255,255,255,0.07)"
              : "rgba(0,0,0,0.06)",
          },
        ]}
      />
    </View>
  );
};

interface SkeletonLoaderProps {
  count?: number;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ count = 4 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} index={i} />
      ))}
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    width: "100%",
    padding: 16,
    paddingBottom: 10,
    overflow: "hidden",
  },
  lineTall: {
    height: 18,
    borderRadius: 6,
  },
  lineShort: {
    height: 14,
    borderRadius: 5,
  },
  lineThin: {
    height: 11,
    borderRadius: 4,
  },
  lineDesc: {
    height: 11,
    borderRadius: 4,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    marginBottom: 10,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 8,
  },
  imagePlaceholder: {
    width: "100%",
    height: 140,
    borderRadius: 12,
    marginTop: 12,
    marginBottom: 10,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
    marginBottom: 10,
  },
  btnPlaceholder: {
    height: 36,
    borderRadius: 10,
    marginTop: 4,
    marginBottom: 6,
  },
  divider: {
    height: 1,
    width: "100%",
    marginTop: 14,
  },
});

export default SkeletonLoader;
