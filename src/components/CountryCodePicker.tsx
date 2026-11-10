import { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppText from '@/components/AppText';
import {
  COUNTRIES,
  DEFAULT_COUNTRY,
  filterCountries,
  type Country,
} from '@/constants/countryCodes';
import { COLORS } from '@/styles/colors';
import { rm, rs } from '@/styles/responsive';
import { FONT_BY_WEIGHT, TEXT_SCALE_PROPS } from '@/styles/typography';

type Props = {
  value?: Country;
  onChange: (country: Country) => void;
};

// The small "flag +254 v" button inside PhoneField, and the full-screen country list it opens.
// The trigger never shrinks (flexShrink 0) and its text is one line, so the code can't be squeezed out
// by the number box next to it (that is what hid "+254" before).
export function CountryCodePicker({ value = DEFAULT_COUNTRY, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const data = useMemo(() => filterCountries(COUNTRIES, query), [query]);

  const close = () => {
    setOpen(false);
    setQuery('');
  };

  const select = (country: Country) => {
    onChange(country);
    close();
  };

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={`Country code ${value.dialCode}, ${value.name}. Tap to change`}
        style={styles.trigger}>
        <AppText variant="body" numberOfLines={1} style={styles.triggerText}>
          {value.flag} {value.dialCode}
        </AppText>
        <AppText variant="caption" style={styles.chevron}>▾</AppText>
      </Pressable>

      <Modal visible={open} animationType="slide" onRequestClose={close}>
        <View style={styles.modalContainer}>
          <SafeAreaView style={styles.flex}>
            <View style={styles.header}>
              <AppText variant="title" weight="bold">Select country</AppText>
              <Pressable onPress={close} hitSlop={12} accessibilityRole="button" accessibilityLabel="Close">
                <AppText variant="body" weight="medium" style={{ color: COLORS.green }}>Close</AppText>
              </Pressable>
            </View>

            <TextInput
              {...TEXT_SCALE_PROPS}
              value={query}
              onChangeText={setQuery}
              placeholder="Search country or code"
              placeholderTextColor={COLORS.faint}
              autoCorrect={false}
              autoCapitalize="none"
              clearButtonMode="while-editing"
              accessibilityLabel="Search country or code"
              style={styles.search}
            />

            <FlatList
              style={styles.list}
              data={data}
              keyExtractor={(item) => item.code}
              keyboardShouldPersistTaps="handled"
              initialNumToRender={20}
              ListEmptyComponent={
                <AppText variant="small" className="text-gray-500" style={styles.empty}>
                  No countries match "{query}"
                </AppText>
              }
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => select(item)}
                  accessibilityRole="button"
                  accessibilityLabel={`${item.name} ${item.dialCode}`}
                  accessibilityState={{ selected: item.code === value.code }}
                  style={({ pressed }) => [
                    styles.row,
                    (pressed || item.code === value.code) && styles.rowSelected,
                  ]}>
                  <AppText variant="large">{item.flag}</AppText>
                  <AppText variant="body" numberOfLines={1} style={styles.name}>{item.name}</AppText>
                  <AppText variant="small" className="text-gray-500" style={styles.dialCode}>{item.dialCode}</AppText>
                </Pressable>
              )}
            />
          </SafeAreaView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  modalContainer: { flex: 1, backgroundColor: COLORS.white },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,          // never squeezed by the number box next to it
    gap: rs(6),
    minHeight: rm(44),
  },
  triggerText: { flexShrink: 0, color: COLORS.ink },
  chevron: { color: COLORS.muted },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: rs(16),
    paddingTop: rm(16),
    paddingBottom: rm(8),
  },
  search: {
    marginHorizontal: rs(16),
    marginBottom: rm(12),
    paddingHorizontal: rs(16),
    paddingVertical: rm(12),
    borderRadius: rm(8),
    fontFamily: FONT_BY_WEIGHT.regular,
    fontSize: rm(15),
    backgroundColor: '#F3F4F6',
    color: COLORS.ink,
  },
  list: { flex: 1 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(12),
    minHeight: rm(52),
    paddingHorizontal: rs(16),
    paddingVertical: rm(10),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  rowSelected: { backgroundColor: '#F3F4F6' },
  name: { flex: 1, color: COLORS.ink },
  dialCode: { flexShrink: 0 },
  empty: { textAlign: 'center', padding: rs(16) },
});