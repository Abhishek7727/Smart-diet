import { GlassInput } from "./GlassInput";
import { PrimaryButton } from "./PrimaryButton";
import { ThemedBackground } from "./ThemedBackground";
import { SafeAreaView } from "react-native-safe-area-context";
import { Modal, View, ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native";
import React from "react";
import GeminiService from "@/services/GeminiService";
import { useSearchParams } from "expo-router/build/hooks";
import { useSelector } from "react-redux";

type CustomMealData = {
  name: string;
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
};

type CustomMealModalProps = {
  visible: boolean;
  colors: any;
  customMealData: CustomMealData;
  setCustomMealData: React.Dispatch<React.SetStateAction<CustomMealData>>;
  onClose: () => void;
  onSave: () => void;
};

const CustomMealModal = React.memo(function CustomMealModal({
  visible,
  colors,
  customMealData,
  setCustomMealData,
  onClose,
  onSave,
}: CustomMealModalProps) {
  const userData = useSelector((state: any) => state.user);
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <ThemedBackground>
        <SafeAreaView style={styles.modalContainer}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
              <Text style={{ color: colors.primary, fontSize: 16 }}>Cancel</Text>
            </TouchableOpacity>

            <Text style={[styles.modalTitle, { color: colors.text }]}>Add Custom Meal</Text>
            <View style={{ width: 50 }} />
          </View>

          <ScrollView style={styles.modalContent} keyboardShouldPersistTaps="handled">
            <GlassInput
              aiEnabled={true}
              aiFunction={async () => {
                  const data = await GeminiService.smartDataFill(customMealData.name, userData.apiKey);
                  setCustomMealData((prev) => ({...prev, ...data}));
              }}
              placeholder="e.g. Grilled Chicken Salad"
              value={customMealData.name}
              onChangeText={(text) => setCustomMealData((prev) => ({ ...prev, name: text }))}
              label="Meal Name"
            />

            <GlassInput
              placeholder="0"
              value={customMealData.calories}
              onChangeText={(text) => setCustomMealData((prev) => ({ ...prev, calories: text }))}
              label="Calories"
            />

            <View style={styles.macroInputsContainer}>
              <View style={{ flex: 1 }}>
                <GlassInput
                  placeholder="0"
                  value={customMealData.protein}
                  onChangeText={(text) => setCustomMealData((prev) => ({ ...prev, protein: text }))}
                  label="Protein (g)"
                />
              </View>

              <View style={{ flex: 1 }}>
                <GlassInput
                  placeholder="0"
                  value={customMealData.carbs}
                  onChangeText={(text) => setCustomMealData((prev) => ({ ...prev, carbs: text }))}
                  label="Carbs (g)"
                />
              </View>

              <View style={{ flex: 1 }}>
                <GlassInput
                  placeholder="0"
                  value={customMealData.fat}
                  onChangeText={(text) => setCustomMealData((prev) => ({ ...prev, fat: text }))}
                  label="Fat (g)"
                />
              </View>
            </View>

            <PrimaryButton title="Save Meal" onPress={onSave} style={styles.modalSaveButton} />
          </ScrollView>
        </SafeAreaView>
      </ThemedBackground>
    </Modal>
  );
});

export {CustomMealModal};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalCloseButton: {
    padding: 8,
  },
  modalSaveButton: {
    marginTop: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalContent: {
    flex: 1,
    padding: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 4,
  },
  macroInputsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
});
