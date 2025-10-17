import React from 'react';
import { Ionicons } from '@expo/vector-icons';

interface IconProps {
    color?: string;
    name: keyof typeof Ionicons.glyphMap;
    size?: number;
    style?: any;
}

const Icon = ({ color, name, size, style }: IconProps) => {
    return <Ionicons name={name} size={size} color={color} style={style} />
}

export default Icon;