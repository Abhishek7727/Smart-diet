import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, FlatList, Platform, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';


interface Option {
    label: string;
    value: string;
    subtitle?: string;
}

interface GlassDropdownProps {
    label: string;
    value: string;
    options: Option[];
    onSelect: (value: string) => void;
    icon?: string;
}

export function GlassDropdown({ label, value, options, onSelect, icon }: GlassDropdownProps) {
    const [visible, setVisible] = useState(false);
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

    const selectedOption = options.find(opt => opt.value === value);

    return (
        <>
            <TouchableOpacity
                onPress={() => setVisible(true)}
                style={[styles.container, {
                    backgroundColor: colors.surfaceHighlight,
                    borderColor: colors.glass.borderColor,
                    borderWidth: 1,
                }]}
            >
                {icon && <Ionicons name={icon as any} size={20} color={colors.icon} style={styles.icon} />}
                <View style={styles.content}>
                    {value ? (
                        <Text style={[styles.value, { color: colors.text }]}>{selectedOption?.label || value}</Text>
                    ) : (
                        <Text style={[styles.placeholder, { color: colors.icon }]}>{label}</Text>
                    )}
                </View>
                <Ionicons name="chevron-down" size={20} color={colors.icon} />
            </TouchableOpacity>

            <Modal
                visible={visible}
                transparent
                animationType="fade"
                onRequestClose={() => setVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setVisible(false)}
                >
                    <View style={[styles.dropdownContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
                        <FlatList
                            data={options}
                            keyExtractor={(item) => item.value}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[styles.optionItem, { borderBottomColor: colors.border }]}
                                    onPress={() => {
                                        onSelect(item.value);
                                        setVisible(false);
                                    }}
                                >
                                    <View>
                                        <Text style={[styles.optionLabel, {
                                            color: item.value === value ? colors.primary : colors.text,
                                            fontWeight: item.value === value ? '700' : '400'
                                        }]}>
                                            {item.label}
                                        </Text>
                                        {item.subtitle && (
                                            <Text style={[styles.optionSubtitle, { color: colors.icon }]}>
                                                {item.subtitle}
                                            </Text>
                                        )}
                                    </View>
                                    {item.value === value && (
                                        <Ionicons name="checkmark" size={20} color={colors.primary} />
                                    )}
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 56,
        borderRadius: 16,
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    icon: {
        marginRight: 12,
    },
    content: {
        flex: 1,
    },
    value: {
        fontSize: 16,
    },
    placeholder: {
        fontSize: 16,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 24,
    },
    dropdownContainer: {
        borderRadius: 24,
        borderWidth: 1,
        maxHeight: '60%',
        overflow: 'hidden',
    },
    optionItem: {
        paddingVertical: 16,
        paddingHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    optionLabel: {
        fontSize: 16,
    },
    optionSubtitle: {
        fontSize: 12,
        marginTop: 4,
    }
});
