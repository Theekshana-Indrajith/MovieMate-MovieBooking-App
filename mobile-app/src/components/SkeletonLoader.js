import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';

const SkeletonLoader = ({ width, height, borderRadius = 8, style }) => {
    const opacity = useRef(new Animated.Value(0.4)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, {
                    toValue: 0.8,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0.4,
                    duration: 800,
                    useNativeDriver: true,
                })
            ])
        ).start();
    }, [opacity]);

    return (
        <Animated.View style={[
            { width, height, borderRadius, backgroundColor: '#334155', opacity },
            style
        ]} />
    );
};

export default SkeletonLoader;
