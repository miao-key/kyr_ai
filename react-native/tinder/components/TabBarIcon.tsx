import React from 'react';
import {
    Text,View
} from 'react-native';
import Icon from './Icon';

interface TabBarIconProps {
    focused: boolean;
    iconName: string;
    text: string;
}

const TabBarIcon = ({ focused, iconName, text }: TabBarIconProps) => {
    return (
        <View>
            <Icon name={iconName as any} size={16} color={focused ? '#123' : '#456'}/>
        </View>
    )
}

export default TabBarIcon;